const AdventurePage = {
    template: `
        <div>
            <div class="stage-info">
                <div class="stage-header">
                    <h3>{{ currentStage.name }}</h3>
                    <span class="difficulty">{{ '⭐'.repeat(Math.min(currentStage.difficulty, 10)) }}</span>
                </div>
                <button @click="autoProgress = !autoProgress"
                        class="btn-auto" :class="{ active: autoProgress }">
                    {{ autoProgress ? '⏸ 停止闯关' : '▶ 自动闯关' }}
                </button>
            </div>
            <div class="battle-log" ref="logBox">
                <div v-for="(log, i) in battleLogs" :key="i" :class="log.type">
                    {{ log.text }}
                </div>
                <div v-if="!battleLogs.length" class="empty-log">战斗即将开始...</div>
            </div>
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
        const autoProgress = ref(false);

        const currentStage = computed(() => {
            return STAGES.find(s => s.id === gameData.value.currentStage) || STAGES[0];
        });

        const chapters = computed(() => {
            const maxIdx = STAGES.findIndex(s => s.id === gameData.value.maxStage);
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

        function scrollLogToBottom() {
            nextTick(() => {
                if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight;
            });
        }

        function selectStage(stage) {
            gameData.value.currentStage = stage.id;
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

                    const currentIdx = STAGES.findIndex(s => s.id === gameData.value.currentStage);
                    const maxIdx = STAGES.findIndex(s => s.id === gameData.value.maxStage);
                    if (currentIdx >= maxIdx && currentIdx < STAGES.length - 1) {
                        gameData.value.maxStage = STAGES[currentIdx + 1].id;
                    }

                    if (autoProgress.value && currentIdx < STAGES.length - 1) {
                        gameData.value.currentStage = STAGES[currentIdx + 1].id;
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

        onMounted(() => startBattle());
        onUnmounted(() => {
            if (battleInterval) clearInterval(battleInterval);
        });

        return { currentStage, chapters, battleLogs, logBox, autoProgress, selectStage };
    }
};
