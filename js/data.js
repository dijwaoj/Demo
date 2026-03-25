const ROLES = [
    { id: 'warrior', name: '战士', icon: '⚔️', hp: 120, atk: 15, def: 12, crit: 5 },
    { id: 'mage', name: '法师', icon: '🔮', hp: 80, atk: 25, def: 5, crit: 10 },
    { id: 'archer', name: '弓手', icon: '🏹', hp: 90, atk: 20, def: 8, crit: 15 },
    { id: 'priest', name: '牧师', icon: '✝️', hp: 100, atk: 10, def: 10, crit: 5 }
];

const EQUIP_TYPES = ['weapon', 'armor', 'accessory'];

const EQUIP_NAMES = {
    warrior: {
        weapon: ['木剑', '铁剑', '钢剑', '魔剑', '神剑'],
        armor: ['布铠', '铁铠', '钢铠', '魔铠', '圣铠'],
        accessory: ['石戒', '银戒', '金戒', '魔戒', '神戒']
    },
    mage: {
        weapon: ['木杖', '铁杖', '钢杖', '魔杖', '神杖'],
        armor: ['布袍', '皮袍', '丝袍', '魔袍', '圣袍'],
        accessory: ['石戒', '银戒', '金戒', '魔戒', '神戒']
    },
    archer: {
        weapon: ['木弓', '铁弓', '钢弓', '魔弓', '神弓'],
        armor: ['轻甲', '皮甲', '板甲', '魔甲', '圣甲'],
        accessory: ['石戒', '银戒', '金戒', '魔戒', '神戒']
    },
    priest: {
        weapon: ['木杖', '铁杖', '钢杖', '圣杖', '神杖'],
        armor: ['布袍', '皮袍', '丝袍', '圣袍', '神袍'],
        accessory: ['石戒', '银戒', '金戒', '魔戒', '神戒']
    }
};

const QUALITY_COLORS = { 1: '#fff', 2: '#4ade80', 3: '#60a5fa', 4: '#a78bfa', 5: '#fb923c' };

const STAGES = [];
for (let chapter = 1; chapter <= 3; chapter++) {
    for (let level = 1; level <= 10; level++) {
        STAGES.push({
            id: `${chapter}-${level}`,
            name: `第${chapter}章 第${level}关`,
            chapter,
            level,
            difficulty: (chapter - 1) * 10 + level,
            hp: 50 + (chapter - 1) * 200 + level * 20,
            atk: 5 + (chapter - 1) * 10 + level * 2
        });
    }
}
