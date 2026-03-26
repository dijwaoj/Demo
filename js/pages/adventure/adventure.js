const AdventurePage = {
    template: `
        <div class="adventure-page">
            <!-- 当前角色信息 -->
            <div class="hero-bar" v-if="activeHero">
                <span class="hero-icon" :style="{ color: getPathway(activeHero.pathway)?.color }">
                    {{ getPathway(activeHero.pathway)?.icon }}
                </span>
                <span class="hero-name">{{ getSequenceName(activeHero.pathway, activeHero.sequence) }}</span>
                <span class="hero-seq">序列{{ activeHero.sequence }}</span>
            </div>

            <!-- 战斗区域 -->
            <div class="battle-area">
                <canvas id="effect-canvas" ref="effectCanvas"></canvas>
                <div class="battle-info">
                    <div class="stage-info">
                        <div class="stage-header">
                            <h3>{{ currentStageData.name }}</h3>
                            <span class="stage-type" v-if="currentStageData.type !== 'normal'">
                                {{ currentStageData.icon }}
                            </span>
                        </div>
                        <button @click="autoProgress = !autoProgress"
                                class="btn-auto" :class="{ active: autoProgress }">
                            {{ autoProgress ? '⏸ 停止闯关' : '▶ 自动闯关' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- 大招技能按钮 -->
            <div v-if="activeHero && activeHero.sequence <= 5" class="ultimate-skills">
                <button v-for="skill in ultimateSkills" :key="skill.id"
                        class="btn-ultimate"
                        :disabled="skillCooldowns[skill.id] > 0"
                        @click="useUltimate(skill)">
                    <span class="skill-name">{{ skill.name }}</span>
                    <span v-if="skillCooldowns[skill.id] > 0" class="cooldown">
                        {{ skillCooldowns[skill.id] }}s
                    </span>
                </button>
            </div>

            <!-- 战斗日志 -->
            <div class="battle-log" ref="logBox">
                <div v-for="(log, i) in battleLogs" :key="i" :class="log.type">
                    {{ log.text }}
                </div>
                <div v-if="!battleLogs.length" class="empty-log">战斗即将开始...</div>
            </div>

            <!-- 章节关卡网格 -->
            <div class="chapters">
                <div v-for="ch in chapters" :key="ch.chapter" class="chapter">
                    <h4 class="chapter-title">第{{ ch.chapter }}章</h4>
                    <div class="stage-grid">
                        <div v-for="stage in ch.stages" :key="stage.id"
                             class="stage-cell" :class="[stage.status, stage.type]"
                             @click="stage.status !== 'locked' && selectStage(stage)">
                            <span class="stage-num">{{ stage.level }}</span>
                            <span class="stage-icon">{{ stage.icon || '' }}</span>
                            <span v-if="stage.status === 'cleared'" class="stage-mark">✓</span>
                            <span v-else-if="stage.status === 'current'" class="stage-mark">⚔️</span>
                            <span v-else-if="stage.status === 'unlockable'" class="stage-mark">?</span>
                            <span v-else class="stage-mark">🔒</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    setup() {
        const { ref, computed, inject, nextTick, onMounted, onUnmounted } = Vue;
        const gameData = inject('gameData');
        const battleLogs = inject('battleLogs');
        const logBox = ref(null);
        const effectCanvas = ref(null);
        const autoProgress = ref(false);
        const skillCooldowns = ref({});

        // 获取当前活跃英雄
        const activeHero = computed(() => {
            return gameData.value.heroes.find(h => h.id === gameData.value.activeHeroId) || gameData.value.heroes[0];
        });

        // 获取大招技能
        const ultimateSkills = computed(() => {
            if (!activeHero.value) return [];
            if (activeHero.value.sequence > 5) return [];
            if (typeof getSkillsBySequence !== 'function') return [];
            return getSkillsBySequence(activeHero.value.pathway, activeHero.value.sequence)
                .filter(s => s.type === 'ultimate');
        });

        function getPathway(id) {
            return PATHWAYS.find(p => p.id === id);
        }

        function getSequenceName(pathwayId, seq) {
            const pathway = getPathway(pathwayId);
            return pathway ? pathway.sequences[9 - seq] : '未知';
        }

        // 当前关卡数据
        const currentStageData = computed(() => {
            if (!activeHero.value) return STAGES[0];
            return STAGES.find(s => s.id === activeHero.value.currentStage) || STAGES[0];
        });

        // 章节数据 - 基于当前英雄的进度
        const chapters = computed(() => {
            if (!activeHero.value) return [];
            const maxIdx = STAGES.findIndex(s => s.id === activeHero.value.maxStage);
            const result = [];
            for (let ch = 1; ch <= 3; ch++) {
                const chStages = STAGES.filter(s => s.chapter === ch).map((s, i) => {
                    const globalIdx = (ch - 1) * 10 + i;
                    let status = 'locked';
                    if (globalIdx < maxIdx) status = 'cleared';
                    else if (globalIdx === maxIdx) status = 'current';
                    else if (globalIdx === maxIdx + 1) status = 'unlockable';
                    return { ...s, status };
                });
                result.push({ chapter: ch, stages: chStages });
            }
            return result;
        });

        // 使用大招
        function useUltimate(skill) {
            if (!skill || skillCooldowns.value[skill.id] > 0) return;
            
            // 播放粒子特效
            if (effectCanvas.value && typeof playEffect === 'function') {
                const animation = skill.animation || 'default';
                playEffect(animation, effectCanvas.value);
            }

            // 造成伤害
            const damage = skill.effect.value || 200;
            battleLogs.value.push({ text: `💥 释放${skill.name}！造成${damage}%伤害！`, type: 'win' });

            // 设置冷却
            skillCooldowns.value[skill.id] = skill.cooldown || 30;
            const cdInterval = setInterval(() => {
                if (skillCooldowns.value[skill.id] > 0) {
                    skillCooldowns.value[skill.id]--;
                } else {
                    clearInterval(cdInterval);
                }
            }, 1000);

            scrollLogToBottom();
        }

        function scrollLogToBottom() {
            nextTick(() => {
                if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight;
            });
        }

        function selectStage(stage) {
            if (!activeHero.value) return;
            activeHero.value.currentStage = stage.id;
            battleLogs.value = [];
        }

        let battleInterval = null;
        function startBattle() {
            battleInterval = setInterval(() => {
                if (!activeHero.value) return;
                const stage = STAGES.find(s => s.id === activeHero.value.currentStage);
                if (!stage) return;

                // 计算战斗结果
                const heroPower = calcHeroPower(activeHero.value);
                const stagePower = stage.hp + stage.atk * 5;
                const win = heroPower > stagePower * 0.8;

                if (win) {
                    // 金币掉落
                    const gold = Math.floor((10 + stage.difficulty * 5 + Math.random() * 20) * stage.dropBonus);
                    gameData.value.gold += gold;
                    battleLogs.value.push({ text: `战斗胜利！获得 ${gold} 金币`, type: 'win' });

                    // 装备掉落
                    if (Math.random() < 0.3 * stage.dropBonus) {
                        const equip = generatePathwayEquipment(activeHero.value.pathway);
                        if (equip) {
                            if (!gameData.value.inventory) gameData.value.inventory = [];
                            addToInventory(gameData.value.inventory, equip);
                            sortInventory(gameData.value.inventory);
                            battleLogs.value.push({ text: `掉落装备: ${equip.name}`, type: 'drop' });
                        }
                    }

                    // 材料掉落 (BOSS关)
                    if (stage.type === 'boss' || stage.type === 'bigboss' || stage.type === 'elite') {
                        const materialChance = stage.type === 'bigboss' ? 0.5 : stage.type === 'boss' ? 0.3 : 0.1;
                        if (Math.random() < materialChance) {
                            gameData.value.material = (gameData.value.material || 0) + 1;
                            battleLogs.value.push({ text: `获得灵性碎片 ×1`, type: 'drop' });
                        }
                    }

                    // 解锁下一关
                    const currentIdx = STAGES.findIndex(s => s.id === activeHero.value.currentStage);
                    const maxIdx = STAGES.findIndex(s => s.id === activeHero.value.maxStage);
                    if (currentIdx >= maxIdx && currentIdx < STAGES.length - 1) {
                        activeHero.value.maxStage = STAGES[currentIdx + 1].id;
                    }

                    // 自动推进
                    if (autoProgress.value && currentIdx < STAGES.length - 1) {
                        activeHero.value.currentStage = STAGES[currentIdx + 1].id;
                        battleLogs.value.push({ text: `➡️ 前进到 ${STAGES[currentIdx + 1].name}`, type: 'drop' });
                    }

                    scrollLogToBottom();
                } else {
                    battleLogs.value.push({ text: '战斗失败...', type: 'lose' });
                    if (autoProgress.value) {
                        autoProgress.value = false;
                        battleLogs.value.push({ text: '⛔ 自动闯关结束', type: 'lose' });
                    }
                    scrollLogToBottom();
                }

                if (battleLogs.value.length > 50) battleLogs.value.shift();
            }, 3000);
        }

        function calcHeroPower(hero) {
            const pathway = getPathway(hero.pathway);
            if (!pathway) return 0;
            const stats = pathway.baseStats;
            const levelBonus = hero.level * 5;
            const seqBonus = (9 - hero.sequence) * 20;
            return stats.hp + stats.atk * 3 + stats.def * 2 + levelBonus + seqBonus;
        }

        function generatePathwayEquipment(pathwayId) {
            const pathway = getPathway(pathwayId);
            if (!pathway) return null;
            
            const qualityRoll = Math.random();
            const quality = qualityRoll < 0.05 ? 5 : qualityRoll < 0.15 ? 4 : qualityRoll < 0.3 ? 3 : qualityRoll < 0.5 ? 2 : 1;
            const types = ['weapon', 'armor', 'accessory'];
            const type = types[Math.floor(Math.random() * 3)];
            
            const names = {
                weapon: pathway.name.replace('途径', '') + '之器',
                armor: pathway.name.replace('途径', '') + '护甲',
                accessory: pathway.name.replace('途径', '') + '饰品'
            };
            
            return {
                id: Date.now() + Math.random(),
                name: names[type],
                type: type,
                quality: quality,
                level: 1,
                bonus: quality * 5,
                count: 1,
                forRole: pathwayId
            };
        }

        onMounted(() => {
            startBattle();
            // 初始化canvas尺寸
            if (effectCanvas.value) {
                const rect = effectCanvas.value.parentElement.getBoundingClientRect();
                effectCanvas.value.width = rect.width;
                effectCanvas.value.height = rect.height;
            }
        });
        onUnmounted(() => {
            if (battleInterval) clearInterval(battleInterval);
        });

        return {
            gameData, activeHero, currentStageData, chapters, battleLogs, logBox, autoProgress,
            effectCanvas, ultimateSkills, skillCooldowns,
            getPathway, getSequenceName, selectStage, useUltimate
        };
    }
};
