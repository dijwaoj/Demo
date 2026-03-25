const SAVE_KEY = 'idle_rpg_save';

const DEFAULT_SAVE = {
    gold: 100,
    heroes: [{ roleId: 'warrior', level: 1, exp: 0, equipment: { weapon: null, armor: null, accessory: null } }],
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
    let totalDef = 0;
    let totalHp = 0;
    heroes.forEach(h => {
        const role = ROLES.find(r => r.id === h.roleId);
        if (role) {
            let atk = role.atk * (1 + h.level * 0.1);
            let def = role.def * (1 + h.level * 0.1);
            let hp = role.hp * (1 + h.level * 0.1);
            // Apply equipment bonuses
            if (h.equipment) {
                if (h.equipment.weapon) atk += h.equipment.weapon.bonus;
                if (h.equipment.armor) def += h.equipment.armor.bonus;
                if (h.equipment.accessory) hp += h.equipment.accessory.bonus;
            }
            totalAtk += atk;
            totalDef += def;
            totalHp += hp;
        }
    });
    // Win if total attack exceeds stage attack (reduced by defense)
    const effectiveDmg = Math.max(totalAtk - stage.atk * 0.5, 0);
    const win = effectiveDmg > 0 && totalHp > stage.atk * 3;
    return { win };
}

function generateDrops(stage) {
    const drops = { gold: 0, equipment: null };
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
