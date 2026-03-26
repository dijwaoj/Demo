const SAVE_KEY = 'idle_rpg_save';

const DEFAULT_SAVE = {
    gold: 100,
    material: 0,
    heroes: [{ roleId: 'warrior', level: 1, exp: 0, equipment: { weapon: null, armor: null, accessory: null } }],
    equipment: [],
    currentStage: '1-1',
    maxStage: '1-1',
    activeHeroId: 'warrior',
    inventory: [],
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

    // Ensure new fields exist
    if (data.material === undefined) data.material = 0;
    if (!data.activeHeroId && data.heroes && data.heroes.length) data.activeHeroId = data.heroes[0].roleId;
    if (!data.inventory) data.inventory = [];

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
