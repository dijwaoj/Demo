const ShopPage = {
    template: `
        <div class="shop-page">
            <!-- 途径选择 -->
            <div class="pathway-select-section" v-if="!selectedPathway">
                <h3>选择途径召唤</h3>
                <div v-for="group in PATHWAY_GROUPS" :key="group.id" class="pathway-group">
                    <h4 class="group-title" :style="{ color: group.color }">
                        {{ group.icon }} {{ group.name }}
                    </h4>
                    <div class="pathway-options">
                        <div v-for="pwId in group.pathways" :key="pwId" 
                             class="pathway-option"
                             :style="{ borderColor: getPathway(pwId)?.color }"
                             @click="selectPathway(pwId)">
                            <span class="pw-icon">{{ getPathway(pwId)?.icon }}</span>
                            <span class="pw-name">{{ getPathway(pwId)?.name }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 抽卡界面 -->
            <div class="gacha-section" v-else>
                <div class="selected-pathway">
                    <span class="pw-icon" :style="{ color: getPathway(selectedPathway)?.color }">
                        {{ getPathway(selectedPathway)?.icon }}
                    </span>
                    <span class="pw-name">{{ getPathway(selectedPathway)?.name }}</span>
                    <button class="btn-change" @click="selectedPathway = null">更换</button>
                </div>

                <p class="gacha-desc">召唤{{ getPathway(selectedPathway)?.name }}序列9角色 ({{ GACHA_COST }}💰/次)</p>
                
                <div class="material-info">
                    <span>灵性碎片: {{ gameData.material || 0 }}</span>
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
                         class="gacha-result-mini" :class="{ duplicate: !r.isNew }">
                        <span class="gacha-mini-icon">{{ getPathway(selectedPathway)?.icon }}</span>
                        <span class="gacha-mini-name" :style="{ color: getPathway(selectedPathway)?.color }">
                            {{ r.name }}
                        </span>
                        <span v-if="r.isNew" class="gacha-new">NEW</span>
                        <span v-else class="gacha-dup">重复 +1碎片</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    setup() {
        const { ref, computed, inject } = Vue;
        const gameData = inject('gameData');
        const gachaResult = ref(null);
        const selectedPathway = ref(null);
        const GACHA_COST = 200;
        const maxGachaCount = computed(() => Math.floor(gameData.value.gold / GACHA_COST));

        function getPathway(id) {
            return PATHWAYS.find(p => p.id === id);
        }

        function getQualityColor(quality) {
            return QUALITY_COLORS[quality] || '#fff';
        }

        function selectPathway(pwId) {
            selectedPathway.value = pwId;
            gachaResult.value = null;
        }

        function gachaOnce() {
            if (!selectedPathway.value) return null;
            
            // 检查是否已有该途径的角色
            const existing = gameData.value.heroes.find(h => h.pathway === selectedPathway.value);
            const pathway = getPathway(selectedPathway.value);
            
            if (existing) {
                // 重复角色 -> 给材料
                gameData.value.material = (gameData.value.material || 0) + 1;
                return { 
                    name: pathway.name + ' (重复)', 
                    isNew: false 
                };
            } else {
                // 新角色 -> 创建序列9角色
                if (typeof createHero === 'function') {
                    const hero = createHero(selectedPathway.value);
                    if (hero) {
                        gameData.value.heroes.push(hero);
                    }
                }
                return { 
                    name: pathway.sequences[9] + ' (序列9)', 
                    isNew: true 
                };
            }
        }

        function gacha(count) {
            if (!selectedPathway.value) return;
            const cost = GACHA_COST * count;
            if (gameData.value.gold < cost) return;
            
            gameData.value.gold -= cost;
            const results = [];
            for (let i = 0; i < count; i++) {
                const result = gachaOnce();
                if (result) results.push(result);
            }
            gachaResult.value = results;
        }

        return {
            gameData, gachaResult, selectedPathway, GACHA_COST, maxGachaCount,
            PATHWAY_GROUPS, PATHWAYS,
            getPathway, getQualityColor, selectPathway, gacha
        };
    }
};
