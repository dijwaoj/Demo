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
    if (!saved) return { ...DEFAULT_SAVE };
    return JSON.parse(saved);
}

function saveGame(data) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}
