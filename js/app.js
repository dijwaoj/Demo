const { createApp, ref, computed } = Vue;

const app = createApp({
    setup() {
        const gold = ref(100);
        const currentTabId = ref('adventure');
        
        const tabs = [
            { id: 'adventure', name: '冒险', icon: '⚔️' },
            { id: 'heroes', name: '角色', icon: '👥' },
            { id: 'inventory', name: '背包', icon: '🎒' },
            { id: 'shop', name: '商店', icon: '🏪' }
        ];

        return { gold, currentTabId, tabs };
    }
});

app.mount('#app');
