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
                        addToInventory(gameData.value.equipment, drops.equipment);
                        sortInventory(gameData.value.equipment);
                        battleLogs.value.push({ text: `掉落装备: ${drops.equipment.name} (×${drops.equipment.count})`, type: 'drop' });
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
                // Find and enhance all matching items in stack
                const match = gameData.value.equipment.find(e =>
                    e.name === equip.name && e.quality === equip.quality && e.forRole === equip.forRole
                );
                if (match) {
                    match.level++;
                    match.bonus = match.quality * 5 * match.level;
                }
            }
        }

        function sellEquip(equip) {
            gameData.value.gold += sellPrice(equip);
            removeFromInventory(gameData.value.equipment, equip);
        }

        const gachaResult = ref(null);
        const equipTarget = ref(null);
        const GACHA_COST = 200;
        const maxGachaCount = computed(() => Math.floor(gameData.value.gold / GACHA_COST));

        function gachaOnce() {
            const roll = Math.random();
            let roleId;
            if (roll < 0.05) roleId = 'priest';
            else if (roll < 0.15) roleId = 'archer';
            else if (roll < 0.30) roleId = 'mage';
            else if (roll < 0.50) roleId = 'archer';
            else roleId = 'warrior';

            const existing = gameData.value.heroes.find(h => h.roleId === roleId);
            const role = ROLES.find(r => r.id === roleId);

            if (existing) {
                existing.level++;
                return { ...role, quality: 2, name: role.name + ' (等级+1)', isNew: false };
            } else {
                gameData.value.heroes.push({ roleId, level: 1, exp: 0, equipment: { weapon: null, armor: null, accessory: null } });
                return { ...role, quality: roleId === 'priest' ? 5 : roleId === 'archer' ? 4 : roleId === 'mage' ? 3 : 1, isNew: true };
            }
        }

        function gacha(count) {
            const cost = GACHA_COST * count;
            if (gameData.value.gold < cost) return;
            gameData.value.gold -= cost;
            const results = [];
            for (let i = 0; i < count; i++) {
                results.push(gachaOnce());
            }
            gachaResult.value = results;
        }

        function startEquip(equip) {
            equipTarget.value = equip;
        }

        function equipToHero(hero) {
            if (!equipTarget.value) return;
            const equip = equipTarget.value;
            // Check class constraint
            if (equip.forRole && equip.forRole !== hero.roleId) {
                alert(`这件装备是${getRole(equip.forRole).name}专用的！`);
                return;
            }
            const slot = equip.type;
            // If hero already has item in slot, unequip it back to inventory
            if (hero.equipment[slot]) {
                addToInventory(gameData.value.equipment, hero.equipment[slot]);
                sortInventory(gameData.value.equipment);
            }
            // Equip new item (copy from stack)
            hero.equipment[slot] = { ...equip, count: 1 };
            // Remove one from inventory stack
            removeFromInventory(gameData.value.equipment, equip);
            equipTarget.value = null;
        }

        function unequipFromHero(hero, slot) {
            if (!hero.equipment[slot]) return;
            addToInventory(gameData.value.equipment, { ...hero.equipment[slot], count: 1 });
            sortInventory(gameData.value.equipment);
            hero.equipment[slot] = null;
        }

        function getHeroTotalStat(hero, stat) {
            const role = ROLES.find(r => r.id === hero.roleId);
            if (!role) return 0;
            let base = role[stat] * (1 + hero.level * 0.1);
            if (stat === 'atk' && hero.equipment.weapon) base += hero.equipment.weapon.bonus;
            if (stat === 'def' && hero.equipment.armor) base += hero.equipment.armor.bonus;
            if (stat === 'hp' && hero.equipment.accessory) base += hero.equipment.accessory.bonus;
            return Math.floor(base);
        }

        function getRoleLabel(roleId) {
            const role = ROLES.find(r => r.id === roleId);
            return role ? role.name : '';
        }

        function canEquip(equip, hero) {
            return !equip.forRole || equip.forRole === hero.roleId;
        }

        return {
            gameData, gold, currentTabId, tabs,
            battleLogs, showStageSelect, currentStage, availableStages,
            selectStage, selectedHero, getRole, logBox,
            getQualityColor, getEquipTypeLabel, getEquipStatLabel,
            enhanceCost, sellPrice, enhanceEquip, sellEquip,
            gachaResult, gacha, maxGachaCount, GACHA_COST,
            equipTarget, startEquip, equipToHero, unequipFromHero, getHeroTotalStat,
            getRoleLabel, canEquip
        };
    }
});

app.mount('#app');
