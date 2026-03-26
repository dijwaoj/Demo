const HeroesPage = {
    template: `
        <div class="heroes-page">
            <!-- 角色列表 -->
            <div class="heroes-list">
                <div v-for="hero in gameData.heroes" :key="hero.id"
                     class="hero-card" :class="{ active: hero.id === gameData.activeHeroId }"
                     @click="selectHero(hero)">
                    <div class="hero-icon" :style="{ color: getPathway(hero.pathway)?.color }">
                        {{ getPathway(hero.pathway)?.icon }}
                    </div>
                    <div class="hero-info">
                        <h4>{{ getPathway(hero.pathway)?.name }}</h4>
                        <p class="seq-name">{{ getSequenceName(hero.pathway, hero.sequence) }}</p>
                        <p class="hero-level">Lv.{{ hero.level }} · 序列{{ hero.sequence }}</p>
                    </div>
                    <span v-if="hero.id === gameData.activeHeroId" class="active-badge">上阵</span>
                </div>
                <div class="hero-card add-hero" @click="showPathwaySelect = true">
                    <div class="hero-icon">➕</div>
                    <div class="hero-info">
                        <h4>添加角色</h4>
                        <p>选择途径</p>
                    </div>
                </div>
            </div>

            <!-- 角色详情 -->
            <div v-if="selectedHero" class="hero-detail-section">
                <div class="detail-header" :style="{ borderColor: getPathway(selectedHero.pathway)?.color }">
                    <span class="detail-icon">{{ getPathway(selectedHero.pathway)?.icon }}</span>
                    <div>
                        <h3>{{ getPathway(selectedHero.pathway)?.name }}</h3>
                        <p>{{ getSequenceName(selectedHero.pathway, selectedHero.sequence) }} · Lv.{{ selectedHero.level }}</p>
                    </div>
                </div>
                
                <div class="detail-stats">
                    <div class="stat-row"><span>生命</span><span>{{ getHeroStat(selectedHero, 'hp') }}</span></div>
                    <div class="stat-row"><span>攻击</span><span>{{ getHeroStat(selectedHero, 'atk') }}</span></div>
                    <div class="stat-row"><span>防御</span><span>{{ getHeroStat(selectedHero, 'def') }}</span></div>
                    <div class="stat-row"><span>暴击</span><span>{{ getHeroStat(selectedHero, 'crit') }}%</span></div>
                </div>

                <div class="detail-skills">
                    <h4>技能</h4>
                    <div v-for="skill in getHeroSkillsList(selectedHero)" :key="skill.id" class="skill-item">
                        <span class="skill-type" :class="skill.type">{{ skill.type === 'passive' ? '被动' : skill.type === 'ultimate' ? '大招' : '主动' }}</span>
                        <span class="skill-name">{{ skill.name }}</span>
                        <span class="skill-desc">{{ skill.desc }}</span>
                    </div>
                </div>

                <div class="detail-equip">
                    <h4>装备</h4>
                    <div v-for="slot in ['weapon', 'armor', 'accessory']" :key="slot" class="equip-slot">
                        <span class="slot-label">{{ getEquipLabel(slot) }}</span>
                        <span v-if="selectedHero.equipment[slot]" class="slot-item" :style="{ color: getQualityColor(selectedHero.equipment[slot].quality) }">
                            {{ selectedHero.equipment[slot].name }} (+{{ selectedHero.equipment[slot].bonus }})
                        </span>
                        <span v-else class="slot-empty">空</span>
                    </div>
                </div>

                <div class="detail-promotion">
                    <h4>序列晋升</h4>
                    <div v-if="selectedHero.sequence > 0" class="promotion-info">
                        <p>当前: {{ getSequenceName(selectedHero.pathway, selectedHero.sequence) }} (序列{{ selectedHero.sequence }})</p>
                        <p>下一阶: {{ getSequenceName(selectedHero.pathway, selectedHero.sequence - 1) }} (序列{{ selectedHero.sequence - 1 }})</p>
                        <p>需要: {{ getPromotionCost(selectedHero.sequence) }} 灵性碎片 (拥有: {{ gameData.material }})</p>
                        <button class="btn btn-promote" 
                                :disabled="gameData.material < getPromotionCost(selectedHero.sequence)"
                                @click="promoteHero(selectedHero)">
                            晋升
                        </button>
                    </div>
                    <div v-else class="max-seq">
                        <p>已达最高序列: {{ getSequenceName(selectedHero.pathway, 0) }}</p>
                    </div>
                </div>

                <div class="detail-actions">
                    <button class="btn" @click="setActiveHero(selectedHero)" 
                            :disabled="selectedHero.id === gameData.activeHeroId">
                        {{ selectedHero.id === gameData.activeHeroId ? '当前上阵' : '设为上阵' }}
                    </button>
                </div>
            </div>

            <!-- 途径选择弹窗 -->
            <div v-if="showPathwaySelect" class="modal" @click.self="showPathwaySelect = false">
                <div class="modal-content pathway-select">
                    <h3>选择途径</h3>
                    <div v-for="group in PATHWAY_GROUPS" :key="group.id" class="pathway-group">
                        <h4 class="group-title" :style="{ color: group.color }">
                            {{ group.icon }} {{ group.name }}
                        </h4>
                        <div class="pathway-options">
                            <div v-for="pwId in group.pathways" :key="pwId" 
                                 class="pathway-option"
                                 :style="{ borderColor: getPathway(pwId)?.color }"
                                 @click="addNewHero(pwId)">
                                <span class="pw-icon">{{ getPathway(pwId)?.icon }}</span>
                                <span class="pw-name">{{ getPathway(pwId)?.name }}</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn" @click="showPathwaySelect = false" style="margin-top: 15px; width: 100%;">取消</button>
                </div>
            </div>
        </div>
    `,
    setup() {
        const { ref, inject } = Vue;
        const gameData = inject('gameData');
        const selectedHero = ref(null);
        const showPathwaySelect = ref(false);

        function getPathway(id) {
            return PATHWAYS.find(p => p.id === id);
        }

        function getSequenceName(pathwayId, seq) {
            const pathway = getPathway(pathwayId);
            return pathway ? pathway.sequences[9 - seq] : '未知';
        }

        function getHeroStat(hero, stat) {
            const pathway = getPathway(hero.pathway);
            if (!pathway) return 0;
            const base = pathway.baseStats[stat] || 0;
            const levelBonus = Math.floor(base * hero.level * 0.05);
            const seqBonus = Math.floor(base * (9 - hero.sequence) * 0.15);
            return base + levelBonus + seqBonus;
        }

        function getHeroSkillsList(hero) {
            if (typeof getSkillsBySequence === 'function') {
                return getSkillsBySequence(hero.pathway, hero.sequence);
            }
            return [];
        }

        function getEquipLabel(slot) {
            const labels = { weapon: '武器', armor: '防具', accessory: '饰品' };
            return labels[slot] || slot;
        }

        function getQualityColor(quality) {
            return QUALITY_COLORS[quality] || '#fff';
        }

        function getPromotionCost(seq) {
            const costs = { 8: 1, 7: 2, 6: 3, 5: 4, 4: 5, 3: 6, 2: 7, 1: 8, 0: 9 };
            return costs[seq - 1] || 0;
        }

        function selectHero(hero) {
            selectedHero.value = hero;
        }

        function setActiveHero(hero) {
            gameData.value.activeHeroId = hero.id;
        }

        function addNewHero(pathwayId) {
            if (typeof createHero === 'function') {
                const hero = createHero(pathwayId);
                if (hero) {
                    gameData.value.heroes.push(hero);
                    showPathwaySelect.value = false;
                    selectedHero.value = hero;
                }
            }
        }

        function promoteHero(hero) {
            if (typeof promoteHero === 'function') {
                if (promoteHero(hero, gameData.value)) {
                    alert('晋升成功！');
                }
            }
        }

        return {
            gameData, selectedHero, showPathwaySelect,
            PATHWAY_GROUPS, PATHWAYS,
            getPathway, getSequenceName, getHeroStat, getHeroSkillsList,
            getEquipLabel, getQualityColor, getPromotionCost,
            selectHero, setActiveHero, addNewHero, promoteHero
        };
    }
};
