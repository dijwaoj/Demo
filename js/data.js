// ===== 兼容旧角色数据 =====
const ROLES = [
    { id: 'warrior', name: '战士', icon: '⚔️', hp: 120, atk: 15, def: 12, crit: 5 },
    { id: 'mage', name: '法师', icon: '🔮', hp: 80, atk: 25, def: 5, crit: 10 },
    { id: 'archer', name: '弓手', icon: '🏹', hp: 90, atk: 20, def: 8, crit: 15 },
    { id: 'priest', name: '牧师', icon: '✝️', hp: 100, atk: 10, def: 10, crit: 5 }
];

// ===== 装备名称数据（基于途径）=====
// 注：此数据由 js/data/pathways.js 中的 PATHWAYS 自动生成
// 这里保留为空，实际使用时从 PATHWAYS 获取
const EQUIP_NAMES = {};
