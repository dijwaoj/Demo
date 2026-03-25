const { createApp, ref, computed, onMounted, onUnmounted } = Vue;

const app = createApp({
    setup() {
        const gameData = ref(loadGame());
        const gold = computed(() => gameData.value.gold);
        const currentTabId = ref('adventure');
        const battleLogs = ref([]);
        const showStageSelect = ref(false);
        const selectedHero = ref(null);

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
                    if (drops.fragment) {
                        battleLogs.value.push({ text: `获得碎片: ${drops.fragment.name}`, type: 'drop' });
                    }

                    const currentIdx = STAGES.findIndex(s => s.id === gameData.value.currentStage);
                    const maxIdx = STAGES.findIndex(s => s.id === gameData.value.maxStage);
                    if (currentIdx >= maxIdx && currentIdx < STAGES.length - 1) {
                        gameData.value.maxStage = STAGES[currentIdx + 1].id;
                    }
                } else {
                    battleLogs.value.push({ text: '战斗失败...', type: 'lose' });
                }

                if (battleLogs.value.length > 50) battleLogs.value.shift();
            }, 3000);
        }

        let saveInterval = null;
        onMounted(() => {
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

        return {
            gameData, gold, currentTabId, tabs,
            battleLogs, showStageSelect, currentStage, availableStages,
            selectStage, selectedHero, getRole
        };
    }
});

app.mount('#app');
