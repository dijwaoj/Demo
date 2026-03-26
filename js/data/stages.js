const STAGES = [];
for (let chapter = 1; chapter <= 3; chapter++) {
    for (let level = 1; level <= 10; level++) {
        let type = 'normal';
        let icon = '';
        let dropBonus = 1;
        if (level === 3) { type = 'elite'; icon = '💀'; dropBonus = 1.5; }
        else if (level === 5) { type = 'boss'; icon = '👹'; dropBonus = 2; }
        else if (level === 10) { type = 'bigboss'; icon = '🐉'; dropBonus = 3; }
        STAGES.push({
            id: `${chapter}-${level}`,
            name: `第${chapter}章 第${level}关`,
            chapter, level, type, icon, dropBonus,
            difficulty: (chapter - 1) * 10 + level,
            hp: Math.floor((50 + (chapter - 1) * 200 + level * 20) * (type === 'bigboss' ? 3 : type === 'boss' ? 2 : type === 'elite' ? 1.5 : 1)),
            atk: Math.floor((5 + (chapter - 1) * 10 + level * 2) * (type === 'bigboss' ? 2.5 : type === 'boss' ? 1.8 : type === 'elite' ? 1.3 : 1))
        });
    }
}
