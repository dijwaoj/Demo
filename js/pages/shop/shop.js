const ShopPage = {
    template: `
        <div class="shop">
            <div class="gacha-section">
                <h3>召唤冒险者</h3>
                <p class="gacha-desc">消耗金币召唤随机角色 ({{ GACHA_COST }}💰/次)</p>
                <div class="gacha-rates">
                    <span class="rate rate-5">传说 5%</span>
                    <span class="rate rate-4">史诗 10%</span>
                    <span class="rate rate-3">精良 15%</span>
                    <span class="rate rate-2">优秀 20%</span>
                    <span class="rate rate-1">普通 50%</span>
                </div>
                <div class="gacha-buttons">
                    <button @click="gacha(1)" class="btn-gacha" :disabled="gameData.gold < GACHA_COST">
                        单抽 ({{ GACHA_COST }}💰)
                    </button>
                    <button @click="gacha(10)" class="btn-gacha btn-gacha-10" :disabled="gameData.gold < GACHA_COST * 10">
                        10连 ({{ GACHA_COST * 10 }}💰)
                    </button>
                    <button @click="gacha(maxGachaCount)" class="btn-gacha btn-gacha-max" :disabled="maxGachaCount < 1">
                        最大 ×{{ maxGachaCount }}
                    </button>
                </div>
                <div v-if="gachaResult && gachaResult.length" class="gacha-results">
                    <div v-for="(r, i) in gachaResult" :key="i"
                         class="gacha-result-mini" :class="'quality-border-' + r.quality">
                        <span class="gacha-mini-icon">{{ r.icon }}</span>
                        <span class="gacha-mini-name" :style="{ color: getQualityColor(r.quality || 1) }">
                            {{ r.name }}
                        </span>
                        <span v-if="r.isNew" class="gacha-new">NEW</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    setup() {
        const { ref, computed, inject } = Vue;
        const gameData = inject('gameData');
        const gachaResult = ref(null);
        const GACHA_COST = 200;
        const maxGachaCount = computed(() => Math.floor(gameData.value.gold / GACHA_COST));

        function getRole(roleId) {
            return ROLES.find(r => r.id === roleId) || ROLES[0];
        }

        function getQualityColor(quality) {
            return QUALITY_COLORS[quality] || '#fff';
        }

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

        return {
            gameData, gachaResult, GACHA_COST, maxGachaCount,
            getQualityColor, gacha
        };
    }
};
