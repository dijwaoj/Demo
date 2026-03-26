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
    const data = JSON.parse(saved);
    // Migrate old saves - ensure heroes have equipment slots
    if (data.heroes) {
        data.heroes.forEach(h => {
            if (!h.equipment) {
                h.equipment = { weapon: null, armor: null, accessory: null };
            }
        });
    }
    // Migrate old equipment - add forRole and count
    if (data.equipment) {
        data.equipment.forEach(e => {
            if (!e.forRole) e.forRole = 'warrior';
            if (!e.count) e.count = 1;
            if (!e.id) e.id = Date.now() + Math.random();
        });
        sortInventory(data.equipment);
    }
    return data;
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
    const bonus = stage.dropBonus || 1;
    drops.gold = Math.floor((10 + stage.difficulty * 5 + Math.random() * 20) * bonus);

    const dropChance = Math.min(0.3 * bonus, 0.8);
    if (Math.random() < dropChance) {
        const roll = Math.random();
        // Boss stages have better quality chance
        const qBonus = bonus > 1.5 ? 0.1 : 0;
        const quality = roll < (0.05 + qBonus) ? 5 : roll < (0.15 + qBonus) ? 4 : roll < (0.3 + qBonus) ? 3 : roll < 0.5 ? 2 : 1;
        const type = EQUIP_TYPES[Math.floor(Math.random() * 3)];
        const roleIds = Object.keys(EQUIP_NAMES);
        const roleId = roleIds[Math.floor(Math.random() * roleIds.length)];
        const names = EQUIP_NAMES[roleId];
        drops.equipment = {
            name: names[type][quality - 1],
            type,
            quality,
            level: 1,
            bonus: quality * 5,
            count: 1,
            forRole: roleId
        };
    }

    return drops;
}

function enhanceCost(equip) { return equip.level * 50 * equip.quality; }
function sellPrice(equip) { return equip.quality * equip.level * 20 * equip.count; }

// Add equipment to inventory with stacking
function addToInventory(inventory, newEquip) {
    const existing = inventory.find(e =>
        e.name === newEquip.name && e.quality === newEquip.quality && e.forRole === newEquip.forRole
    );
    if (existing) {
        existing.count += newEquip.count;
    } else {
        inventory.push({ ...newEquip });
    }
}

// Remove one from stack, remove entry if count reaches 0
function removeFromInventory(inventory, equip) {
    const idx = inventory.findIndex(e => e.name === equip.name && e.quality === equip.quality && e.forRole === equip.forRole);
    if (idx === -1) return;
    inventory[idx].count--;
    if (inventory[idx].count <= 0) {
        inventory.splice(idx, 1);
    }
}

// Sort inventory by quality (highest first), then by name
function sortInventory(inventory) {
    inventory.sort((a, b) => {
        if (b.quality !== a.quality) return b.quality - a.quality;
        return a.name.localeCompare(b.name, 'zh');
    });
}

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
