const { createApp, ref, computed, onMounted, onUnmounted, nextTick } = Vue;

const app = createApp({
    setup() {
        const gameData = ref(loadGame());
        const gold = computed(() => gameData.value.gold);
        const currentTabId = ref('adventure');
        const battleLogs = ref([]);
        const showStageSelect = ref(false);
        const selectedHero = ref(null);
        const logBox = ref(null);

        const tabs = [
            { id: 'adventure', name: '冒险', icon: '⚔️' },
            { id: 'heroes', name: '角色', icon: '👥' },
            { id: 'inventory', name: '背包', icon: '🎒' },
            { id: 'shop', name: '商店', icon: '🏪' }
        ];

        const currentStage = computed(() => {
            return STAGES.find(s => s.id === gameData.value.currentStage) || STAGES[0];
        });

        const availableStages = computed(() => {
            const maxIdx = STAGES.findIndex(s => s.id === gameData.value.maxStage);
            return STAGES.slice(0, maxIdx + 2);
        });

        function scrollLogToBottom() {
            nextTick(() => {
                if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight;
            });
        }

        function selectStage(stage) {
            gameData.value.currentStage = stage.id;
            showStageSelect.value = false;
            battleLogs.value = [];
        }

        let battleInterval = null;
        function startBattle() {
            battleInterval = setInterval(() => {
                const stage = STAGES.find(s => s.id === gameData.value.currentStage);
                if (!stage) return;

                const result = calculateBattle(gameData.value.heroes, stage);
                if (result.win) {
                    const drops = generateDrops(stage);
                    gameData.value.gold += drops.gold;
                    battleLogs.value.push({ text: `战斗胜利！获得 ${drops.gold} 金币`, type: 'win' });

                    if (drops.equipment) {
                        gameData.value.equipment.push(drops.equipment);
                        battleLogs.value.push({ text: `掉落装备: ${drops.equipment.name}`, type: 'drop' });
                    }
                    scrollLogToBottom();

                    const currentIdx = STAGES.findIndex(s => s.id === gameData.value.currentStage);
                    const maxIdx = STAGES.findIndex(s => s.id === gameData.value.maxStage);
                    if (currentIdx >= maxIdx && currentIdx < STAGES.length - 1) {
                        gameData.value.maxStage = STAGES[currentIdx + 1].id;
                    }
                } else {
                    battleLogs.value.push({ text: '战斗失败...', type: 'lose' });
                    scrollLogToBottom();
                }

                if (battleLogs.value.length > 50) battleLogs.value.shift();
            }, 3000);
        }

        let saveInterval = null;
        onMounted(() => {
            const rewards = calculateOfflineRewards(gameData.value);
            if (rewards.battles > 0) {
                gameData.value.gold += rewards.gold;
                battleLogs.value.push({
                    text: `离线收益：获得 ${rewards.gold} 金币 (${rewards.battles} 场战斗)`,
                    type: 'drop'
                });
                scrollLogToBottom();
            }
            gameData.value.lastOnline = Date.now();
            saveInterval = setInterval(() => saveGame(gameData.value), 30000);
            window.addEventListener('beforeunload', () => saveGame(gameData.value));
            startBattle();
        });
        onUnmounted(() => {
            if (saveInterval) clearInterval(saveInterval);
            if (battleInterval) clearInterval(battleInterval);
        });

        function getRole(roleId) {
            return ROLES.find(r => r.id === roleId) || ROLES[0];
        }

        function getQualityColor(quality) {
            return QUALITY_COLORS[quality] || '#fff';
        }

        function getEquipTypeLabel(type) {
            const labels = { weapon: '武器', armor: '防具', accessory: '饰品' };
            return labels[type] || type;
        }

        function getEquipStatLabel(type) {
            const labels = { weapon: '攻击', armor: '防御', accessory: '暴击' };
            return labels[type] || '';
        }

        function enhanceEquip(equip) {
            const cost = enhanceCost(equip);
            if (gameData.value.gold >= cost) {
                gameData.value.gold -= cost;
                equip.level++;
                equip.bonus = equip.quality * 5 * equip.level;
            }
        }

        function sellEquip(equip) {
            gameData.value.gold += sellPrice(equip);
            gameData.value.equipment = gameData.value.equipment.filter(e => e.id !== equip.id);
        }

        const gachaResult = ref(null);

        function gacha() {
            if (gameData.value.gold < 200) return;
            gameData.value.gold -= 200;

            const roll = Math.random();
            let roleId;
            if (roll < 0.05) roleId = 'priest';       // 5%
            else if (roll < 0.15) roleId = 'archer';   // 10%
            else if (roll < 0.30) roleId = 'mage';     // 15%
            else if (roll < 0.50) roleId = 'archer';   // 20% (duplicate pool)
            else roleId = 'warrior';                    // 50%

            const existing = gameData.value.heroes.find(h => h.roleId === roleId);
            const role = ROLES.find(r => r.id === roleId);

            if (existing) {
                existing.level++;
                gachaResult.value = { ...role, quality: 2, name: role.name + ' (等级+1)' };
            } else {
                gameData.value.heroes.push({ roleId, level: 1, exp: 0 });
                gachaResult.value = { ...role, quality: roleId === 'priest' ? 5 : roleId === 'archer' ? 4 : roleId === 'mage' ? 3 : 1 };
            }
        }

        return {
            gameData, gold, currentTabId, tabs,
            battleLogs, showStageSelect, currentStage, availableStages,
            selectStage, selectedHero, getRole, logBox,
            getQualityColor, getEquipTypeLabel, getEquipStatLabel,
            enhanceEquip, sellEquip,
            gachaResult, gacha
        };
    }
});

app.mount('#app');
