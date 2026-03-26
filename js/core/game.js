const SAVE_KEY = 'idle_rpg_save';

// 新存档结构 - 支持途径系统
const DEFAULT_SAVE = {
    gold: 100,
    material: 0, // 灵性碎片（通用材料）
    heroes: [
        {
            id: 'hero_1',
            pathway: 'fool', // 途径ID
            sequence: 9, // 序列等级 (9最低, 0最高)
            level: 1, // 经验等级
            exp: 0,
            currentStage: '1-1',
            maxStage: '1-1',
            equipment: { weapon: null, armor: null, accessory: null },
            activeSkills: ['fool_9_1', 'fool_9_2'], // 当前激活的技能
            cooldowns: {} // 技能冷却
        }
    ],
    activeHeroId: 'hero_1', // 当前选中的角色
    inventory: [], // 装备背包
    lastOnline: Date.now()
};

// 序列晋升所需材料数量
const PROMOTION_MATERIALS = {
    8: 1,  // 9→8 需要1个
    7: 2,  // 8→7 需要2个
    6: 3,  // 7→6 需要3个
    5: 4,  // 6→5 需要4个
    4: 5,  // 5→4 需要5个
    3: 6,  // 4→3 需要6个
    2: 7,  // 3→2 需要7个
    1: 8,  // 2→1 需要8个
    0: 9   // 1→0 需要9个
};

function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return JSON.parse(JSON.stringify(DEFAULT_SAVE));
    const data = JSON.parse(saved);

    // 迁移旧存档格式到新格式
    if (data.heroes && data.heroes[0] && data.heroes[0].roleId) {
        // 旧格式：roleId, level, exp, equipment
        // 新格式：id, pathway, sequence, level, exp, equipment, activeSkills, cooldowns
        data.heroes = data.heroes.map((h, idx) => ({
            id: h.id || `hero_${idx + 1}`,
            pathway: h.roleId === 'warrior' ? 'red_priest' : 
                     h.roleId === 'mage' ? 'fool' : 
                     h.roleId === 'archer' ? 'hunter' : 'sun',
            sequence: 9,
            level: h.level || 1,
            exp: h.exp || 0,
            currentStage: h.currentStage || data.currentStage || '1-1',
            maxStage: h.maxStage || data.maxStage || '1-1',
            equipment: h.equipment || { weapon: null, armor: null, accessory: null },
            activeSkills: [],
            cooldowns: {}
        }));
    }

    // 确保新字段存在
    if (data.material === undefined) data.material = 0;
    if (!data.activeHeroId && data.heroes && data.heroes.length) {
        data.activeHeroId = data.heroes[0].id;
    }
    if (!data.inventory) data.inventory = [];

    // 为每个英雄添加缺失的字段
    if (data.heroes) {
        data.heroes.forEach(h => {
            if (!h.id) h.id = `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            if (!h.pathway) h.pathway = 'fool';
            if (h.sequence === undefined) h.sequence = 9;
            if (!h.equipment) h.equipment = { weapon: null, armor: null, accessory: null };
            if (!h.activeSkills) h.activeSkills = getSkillsBySequence(h.pathway, h.sequence).map(s => s.id);
            if (!h.cooldowns) h.cooldowns = {};
            if (!h.currentStage) h.currentStage = '1-1';
            if (!h.maxStage) h.maxStage = '1-1';
        });
    }

    // 迁移旧装备格式
    if (data.inventory) {
        data.inventory.forEach(e => {
            if (!e.forRole) e.forRole = 'fool';
            if (!e.count) e.count = 1;
            if (!e.id) e.id = Date.now() + Math.random();
        });
        if (typeof sortInventory === 'function') sortInventory(data.inventory);
    }

    return data;
}

function saveGame(data) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

// 获取当前活跃英雄
function getActiveHero(gameData) {
    return gameData.heroes.find(h => h.id === gameData.activeHeroId) || gameData.heroes[0];
}

// 创建新英雄
function createHero(pathwayId) {
    const pathway = getPathway(pathwayId);
    if (!pathway) return null;
    
    return {
        id: `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pathway: pathwayId,
        sequence: 9,
        level: 1,
        exp: 0,
        currentStage: '1-1',
        maxStage: '1-1',
        equipment: { weapon: null, armor: null, accessory: null },
        activeSkills: getSkillsBySequence(pathwayId, 9).map(s => s.id),
        cooldowns: {}
    };
}

// 晋升英雄序列
function promoteHero(hero, gameData) {
    if (hero.sequence <= 0) return false; // 已经是最高序列
    
    const targetSeq = hero.sequence - 1;
    const required = PROMOTION_MATERIALS[targetSeq];
    
    if (gameData.material < required) return false;
    
    gameData.material -= required;
    hero.sequence = targetSeq;
    hero.activeSkills = getSkillsBySequence(hero.pathway, hero.sequence).map(s => s.id);
    
    return true;
}

// 计算离线收益
function calculateOfflineRewards(gameData) {
    const now = Date.now();
    const elapsed = Math.min(now - gameData.lastOnline, 8 * 60 * 60 * 1000);
    const seconds = elapsed / 1000;
    const battles = Math.floor(seconds / 3);
    
    const hero = getActiveHero(gameData);
    if (!hero) return { gold: 0, material: 0, battles: 0 };
    
    const stage = STAGES.find(s => s.id === hero.currentStage);
    if (!stage) return { gold: 0, material: 0, battles: 0 };
    
    const goldPerBattle = 10 + stage.difficulty * 5;
    const materialChance = 0.1 * (stage.type === 'boss' ? 2 : stage.type === 'bigboss' ? 3 : 1);
    
    return {
        gold: Math.floor(battles * goldPerBattle * 0.5),
        material: Math.floor(battles * materialChance * 0.3),
        battles
    };
}
