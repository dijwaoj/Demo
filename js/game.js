const SAVE_KEY = 'idle_rpg_save';

const DEFAULT_SAVE = {
    gold: 100,
    heroes: [{ roleId: 'warrior', level: 1, exp: 0 }],
    equipment: [],
    currentStage: '1-1',
    maxStage: '1-1',
    lastOnline: Date.now()
};

function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return JSON.parse(JSON.stringify(DEFAULT_SAVE));
    return JSON.parse(saved);
}

function saveGame(data) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function calculateBattle(heroes, stage) {
    let totalAtk = 0;
    heroes.forEach(h => {
        const role = ROLES.find(r => r.id === h.roleId);
        if (role) totalAtk += role.atk * (1 + h.level * 0.1);
    });
    const win = totalAtk > stage.atk * 2;
    return { win };
}

function generateDrops(stage) {
    const drops = { gold: 0, equipment: null, fragment: null };
    drops.gold = Math.floor(10 + stage.difficulty * 5 + Math.random() * 20);

    if (Math.random() < 0.3) {
        const roll = Math.random();
        const quality = roll < 0.05 ? 5 : roll < 0.15 ? 4 : roll < 0.3 ? 3 : roll < 0.5 ? 2 : 1;
        const type = EQUIP_TYPES[Math.floor(Math.random() * 3)];
        drops.equipment = {
            id: Date.now() + Math.random(),
            name: EQUIP_NAMES[type][quality - 1],
            type,
            quality,
            level: 1,
            bonus: quality * 5
        };
    }

    if (Math.random() < 0.1) {
        const role = ROLES[Math.floor(Math.random() * ROLES.length)];
        drops.fragment = { roleId: role.id, name: role.name, count: 1 };
    }

    return drops;
}

function enhanceCost(equip) { return equip.level * 50 * equip.quality; }
function sellPrice(equip) { return equip.quality * equip.level * 20; }

function calculateOfflineRewards(gameData) {
    const now = Date.now();
    const elapsed = Math.min(now - gameData.lastOnline, 8 * 60 * 60 * 1000);
    const seconds = elapsed / 1000;
    const battles = Math.floor(seconds / 3);
    const stage = STAGES.find(s => s.id === gameData.currentStage);
    if (!stage) return { gold: 0, battles: 0 };
    const goldPerBattle = 10 + stage.difficulty * 5;
    return {
        gold: Math.floor(battles * goldPerBattle * 0.5),
        battles
    };
}
