const { createApp, ref, computed, onMounted, onUnmounted, provide } = Vue;

const app = createApp({
    setup() {
        const gameData = ref(loadGame());
        const gold = computed(() => gameData.value.gold);
        const currentTabId = ref('adventure');
        const battleLogs = ref([]);

        provide('gameData', gameData);
        provide('battleLogs', battleLogs);

        const tabs = [
            { id: 'adventure', name: '冒险', icon: '⚔️' },
            { id: 'heroes', name: '角色', icon: '👥' },
            { id: 'inventory', name: '背包', icon: '🎒' },
            { id: 'shop', name: '商店', icon: '🏪' }
        ];

        const tabComponents = {
            adventure: AdventurePage,
            heroes: HeroesPage,
            inventory: InventoryPage,
            shop: ShopPage
        };

        const currentTabComponent = computed(() => tabComponents[currentTabId.value]);

        // Offline rewards
        onMounted(() => {
            const rewards = calculateOfflineRewards(gameData.value);
            if (rewards.battles > 0) {
                gameData.value.gold += rewards.gold;
                battleLogs.value.push({
                    text: `离线收益：获得 ${rewards.gold} 金币 (${rewards.battles} 场战斗)`,
                    type: 'drop'
                });
            }
            gameData.value.lastOnline = Date.now();

            // Auto-save every 30 seconds
            const saveInterval = setInterval(() => saveGame(gameData.value), 30000);
            window.addEventListener('beforeunload', () => saveGame(gameData.value));
        });

        return { gameData, gold, currentTabId, tabs, currentTabComponent, battleLogs };
    }
});

app.component('AdventurePage', AdventurePage);
app.component('HeroesPage', HeroesPage);
app.component('InventoryPage', InventoryPage);
app.component('ShopPage', ShopPage);

app.mount('#app');
