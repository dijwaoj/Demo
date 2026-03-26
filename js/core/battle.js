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

function getHeroTotalStat(hero, stat) {
    const role = ROLES.find(r => r.id === hero.roleId);
    if (!role) return 0;
    let base = role[stat] * (1 + hero.level * 0.1);
    if (stat === 'atk' && hero.equipment.weapon) base += hero.equipment.weapon.bonus;
    if (stat === 'def' && hero.equipment.armor) base += hero.equipment.armor.bonus;
    if (stat === 'hp' && hero.equipment.accessory) base += hero.equipment.accessory.bonus;
    return Math.floor(base);
}
