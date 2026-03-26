function enhanceCost(equip) {
    return equip.level * 50 * equip.quality;
}

function sellPrice(equip) {
    return equip.quality * equip.level * 20 * equip.count;
}

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

function removeFromInventory(inventory, equip) {
    const idx = inventory.findIndex(e => e.name === equip.name && e.quality === equip.quality && e.forRole === equip.forRole);
    if (idx === -1) return;
    inventory[idx].count--;
    if (inventory[idx].count <= 0) {
        inventory.splice(idx, 1);
    }
}

function sortInventory(inventory) {
    inventory.sort((a, b) => {
        if (b.quality !== a.quality) return b.quality - a.quality;
        return a.name.localeCompare(b.name, 'zh');
    });
}
