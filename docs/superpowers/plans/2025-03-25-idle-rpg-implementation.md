# 放置 RPG 冒险者养成游戏 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ []`) syntax for tracking.

**Goal:** 构建一个卡牌风格的放置 RPG 网页游戏 MVP，支持挂机打怪、收集角色、装备强化、关卡推进。

**Architecture:** 单页面 Vue 3 应用，CDN 引入无需构建工具，localStorage 持久化存档，纯静态文件可部署 GitHub Pages。

**Tech Stack:** Vue 3 (CDN), Vanilla CSS, localStorage

---

## 文件结构

```
my-game/
├── index.html          # 入口页面，Vue 模板
├── css/
│   └── style.css       # 全局样式
├── js/
│   ├── data.js         # 静态游戏数据（角色、装备、关卡）
│   ├── game.js         # 核心游戏逻辑（战斗、掉落、强化）
│   └── app.js          # Vue 应用主逻辑
└── docs/
    └── superpowers/
        └── specs/      # 设计文档
```

---

## Task 1: 项目骨架与基础样式

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`（空壳）

- [ ] **Step 1: 创建 index.html 基础结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>放置冒险者</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="app">
        <h1>放置冒险者</h1>
        <p>加载中...</p>
    </div>
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="js/data.js"></script>
    <script src="js/game.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建基础 CSS**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #1a1a2e; color: #eee; }
#app { max-width: 480px; margin: 0 auto; min-height: 100vh; }
```

- [ ] **Step 3: 创建空的 app.js**

```js
const { createApp, ref } = Vue;
createApp({ setup() { return {}; } }).mount('#app');
```

- [ ] **Step 4: 浏览器验证**

打开 `index.html`，确认页面显示"放置冒险者"和"加载中..."

---

## Task 2: 静态游戏数据

**Files:**
- Create: `js/data.js`

- [ ] **Step 1: 定义角色数据**

```js
const ROLES = [
    { id: 'warrior', name: '战士', icon: '⚔️', hp: 120, atk: 15, def: 12, crit: 5 },
    { id: 'mage', name: '法师', icon: '🔮', hp: 80, atk: 25, def: 5, crit: 10 },
    { id: 'archer', name: '弓手', icon: '🏹', hp: 90, atk: 20, def: 8, crit: 15 },
    { id: 'priest', name: '牧师', icon: '✝️', hp: 100, atk: 10, def: 10, crit: 5 }
];
```

- [ ] **Step 2: 定义装备数据**

```js
const EQUIP_TYPES = ['weapon', 'armor', 'accessory'];
const EQUIP_NAMES = {
    weapon: ['木剑', '铁剑', '钢剑', '魔剑', '神剑'],
    armor: ['布甲', '皮甲', '铁甲', '钢甲', '圣甲'],
    accessory: ['石戒', '银戒', '金戒', '魔戒', '神戒']
};
const QUALITY_COLORS = { 1: '#fff', 2: '#4ade80', 2: '#60a5fa', 4: '#a78bfa', 5: '#fb923c' };
```

- [ ] **Step 3: 定义关卡数据**

```js
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
```

- [ ] **Step 4: 浏览器验证**

打开控制台，输入 `ROLES`、`STAGES` 确认数据正确加载。

---

## Task 3: Vue 应用框架与 Tab 导航

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `js/app.js`

- [ ] **Step 1: 更新 index.html 模板**

```html
<div id="app">
    <header>
        <h1>放置冒险者</h1>
        <div class="currency">💰 {{ gold }}</div>
    </header>
    <main>
        <component :is="currentTab"></component>
    </main>
    <nav class="tabs">
        <button v-for="tab in tabs" :key="tab.id"
                :class="{ active: currentTabId === tab.id }"
                @click="currentTabId = tab.id">
            {{ tab.icon }} {{ tab.name }}
        </button>
    </nav>
</div>
```

- [ ] **Step 2: 添加 Tab 样式**

```css
.tabs { display: flex; position: fixed; bottom: 0; width: 100%; max-width: 480px; background: #16213e; }
.tabs button { flex: 1; padding: 12px; border: none; background: transparent; color: #888; cursor: pointer; }
.tabs button.active { color: #fff; background: #0f3460; }
header { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #16213e; }
.currency { font-size: 18px; }
main { padding-bottom: 60px; }
```

- [ ] **Step 3: 实现 app.js Tab 切换**

```js
const { createApp, ref, computed } = Vue;
createApp({
    setup() {
        const gold = ref(100);
        const currentTabId = ref('adventure');
        const tabs = [
            { id: 'adventure', name: '冒险', icon: '⚔️' },
            { id: 'heroes', name: '角色', icon: '👥' },
            { id: 'inventory', name: '背包', icon: '🎒' },
            { id: 'shop', name: '商店', icon: '🏪' }
        ];
        return { gold, currentTabId, tabs };
    }
}).mount('#app');
```

- [ ] **Step 4: 浏览器验证**

确认 Tab 按钮显示，点击可切换（内容暂为空），金币显示在顶部。

---

## Task 4: 存档系统

**Files:**
- Create: `js/game.js`
- Modify: `js/app.js`

- [ ] **Step 1: 在 game.js 实现存档函数**

```js
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
```

- [ ] **Step 2: 在 app.js 集成存档**

```js
setup() {
    const gameData = ref(loadGame());
    const gold = computed(() => gameData.value.gold);
    // 自动保存
    setInterval(() => saveGame(gameData.value), 30000);
    window.addEventListener('beforeunload', () => saveGame(gameData.value));
    return { gameData, gold, ... };
}
```

- [ ] **Step 3: 浏览器验证**

刷新页面，确认金币数值保持不变（localStorage 持久化成功）。

---

## Task 5: 冒险 Tab - 战斗界面

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `js/game.js`
- Modify: `js/app.js`

- [ ] **Step 1: 实现战斗逻辑（game.js）**

```js
function calculateBattle(heroes, stage) {
    let totalAtk = 0, totalHp = 0;
    heroes.forEach(h => {
        const role = ROLES.find(r => r.id === h.roleId);
        totalAtk += role.atk * (1 + h.level * 0.1);
        totalHp += role.hp * (1 + h.level * 0.1);
    });
    const win = totalAtk > stage.atk * 2;
    return { win, damage: Math.floor(Math.random() * 10) };
}

function generateDrops(stage) {
    const drops = { gold: 0, equipment: null, fragment: null };
    drops.gold = Math.floor(10 + stage.difficulty * 5 + Math.random() * 20);
    if (Math.random() < 0.3) {
        const quality = Math.random() < 0.1 ? 5 : Math.random() < 0.2 ? 4 : Math.random() < 0.3 ? 3 : Math.random() < 0.5 ? 2 : 1;
        const type = EQUIP_TYPES[Math.floor(Math.random() * 3)];
        drops.equipment = {
            id: Date.now(),
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
```

- [ ] **Step 2: 实现冒险界面模板（index.html）**

```html
<template id="adventure-template">
    <div class="adventure">
        <div class="stage-info">
            <h3>{{ currentStage.name }}</h3>
            <p>难度: {{ '⭐'.repeat(Math.min(currentStage.difficulty, 10)) }}</p>
        </div>
        <div class="battle-log" ref="logBox">
            <div v-for="(log, i) in battleLogs" :key="i" :class="log.type">
                {{ log.text }}
            </div>
        </div>
        <button @click="changeStage" class="btn">选择关卡</button>
    </div>
</template>
```

- [ ] **Step 3: 实现挂机循环（app.js）**

```js
const battleLogs = ref([]);
let battleInterval = null;

function startBattle() {
    battleInterval = setInterval(() => {
        const stage = STAGES.find(s => s.id === gameData.value.currentStage);
        const result = calculateBattle(gameData.value.heroes, stage);
        if (result.win) {
            const drops = generateDrops(stage);
            gameData.value.gold += drops.gold;
            battleLogs.value.push({ text: `战斗胜利！获得 ${drops.gold} 金币`, type: 'win' });
            if (drops.equipment) {
                gameData.value.equipment.push(drops.equipment);
                battleLogs.value.push({ text: `掉落装备: ${drops.equipment.name}`, type: 'drop' });
            }
            if (drops.fragment) {
                battleLogs.value.push({ text: `获得碎片: ${drops.fragment.name}`, type: 'drop' });
            }
        } else {
            battleLogs.value.push({ text: '战斗失败...', type: 'lose' });
        }
        if (battleLogs.value.length > 50) battleLogs.value.shift();
    }, 3000);
}
```

- [ ] **Step 4: 添加战斗日志样式**

```css
.battle-log { height: 300px; overflow-y: auto; padding: 10px; background: #0f3460; border-radius: 8px; margin: 10px; }
.battle-log .win { color: #4ade80; }
.battle-log .lose { color: #f87171; }
.battle-log .drop { color: #fbbf24; }
.stage-info { padding: 15px; background: #16213e; margin: 10px; border-radius: 8px; }
.btn { padding: 12px 24px; background: #0f3460; border: none; color: white; border-radius: 8px; cursor: pointer; margin: 10px; }
```

- [ ] **Step 5: 浏览器验证**

进入冒险 Tab，确认每 3 秒自动战斗，显示战利品和金币增加。

---

## Task 6: 角色 Tab - 角色列表与详情

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `js/app.js`

- [ ] **Step 1: 实现角色卡片模板**

```html
<template id="heroes-template">
    <div class="heroes">
        <div v-for="hero in gameData.heroes" :key="hero.roleId"
             class="hero-card" :class="'quality-' + (hero.equipment?.weapon?.quality || 1)"
             @click="selectedHero = hero">
            <div class="hero-icon">{{ getRole(hero.roleId).icon }}</div>
            <div class="hero-info">
                <h4>{{ getRole(hero.roleId).name }}</h4>
                <p>Lv.{{ hero.level }}</p>
            </div>
        </div>
        <div v-if="selectedHero" class="hero-detail">
            <h3>{{ getRole(selectedHero.roleId).name }} Lv.{{ selectedHero.level }}</h3>
            <p>HP: {{ getRole(selectedHero.roleId).hp * (1 + selectedHero.level * 0.1) }}</p>
            <p>ATK: {{ getRole(selectedHero.roleId).atk * (1 + selectedHero.level * 0.1) }}</p>
            <p>DEF: {{ getRole(selectedHero.roleId).def * (1 + selectedHero.level * 0.1) }}</p>
            <button @click="selectedHero = null">关闭</button>
        </div>
    </div>
</template>
```

- [ ] **Step 2: 添加卡片样式**

```css
.heroes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 10px; }
.hero-card { background: #16213e; border-radius: 8px; padding: 15px; text-align: center; cursor: pointer; border: 2px solid transparent; }
.hero-card:hover { border-color: #60a5fa; }
.hero-icon { font-size: 36px; }
.hero-detail { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #16213e; padding: 20px; border-radius: 12px; z-index: 100; }
.quality-1 { border-color: #fff !important; }
.quality-2 { border-color: #4ade80 !important; }
.quality-3 { border-color: #60a5fa !important; }
.quality-4 { border-color: #a78bfa !important; }
.quality-5 { border-color: #fb923c !important; }
```

- [ ] **Step 3: 浏览器验证**

进入角色 Tab，点击角色卡片显示详情，确认属性计算正确。

---

## Task 7: 背包 Tab - 装备管理

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `js/app.js`

- [ ] **Step 1: 实现背包模板**

```html
<template id="inventory-template">
    <div class="inventory">
        <div v-for="equip in gameData.equipment" :key="equip.id"
             class="equip-card" :class="'quality-' + equip.quality">
            <div class="equip-name">{{ equip.name }}</div>
            <div class="equip-type">{{ equip.type }}</div>
            <div class="equip-bonus">+{{ equip.bonus }}</div>
            <button @click="enhanceEquip(equip)" class="btn-sm">
                强化 ({{ enhanceCost(equip) }}💰)
            </button>
            <button @click="sellEquip(equip)" class="btn-sm btn-sell">
                出售 ({{ sellPrice(equip) }}💰)
            </button>
        </div>
        <p v-if="!gameData.equipment.length">背包为空</p>
    </div>
</template>
```

- [ ] **Step 2: 实现强化/出售逻辑**

```js
function enhanceCost(equip) { return equip.level * 50 * equip.quality; }
function sellPrice(equip) { return equip.quality * equip.level * 20; }

function enhanceEquip(equip) {
    const cost = enhanceCost(equip);
    if (gameData.value.gold >= cost) {
        gameData.value.gold -= cost;
        equip.level++;
        equip.bonus = equip.quality * 5 * equip.level;
    }
}

function sellEquip(equip) {
    gameData.value.gold += sellPrice(equip);
    gameData.value.equipment = gameData.value.equipment.filter(e => e.id !== equip.id);
}
```

- [ ] **Step 3: 添加背包样式**

```css
.inventory { padding: 10px; }
.equip-card { background: #16213e; border-radius: 8px; padding: 12px; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
.equip-name { flex: 1; font-weight: bold; }
.btn-sm { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; background: #0f3460; color: white; }
.btn-sell { background: #7f1d1d; }
```

- [ ] **Step 4: 浏览器验证**

挂机获得装备后，进入背包确认装备显示、强化消耗金币、出售增加金币。

---

## Task 8: 商店 Tab - 抽卡系统

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `js/app.js`

- [ ] **Step 1: 实现商店模板**

```html
<template id="shop-template">
    <div class="shop">
        <div class="gacha-section">
            <h3>召唤冒险者</h3>
            <button @click="gacha" class="btn-gacha" :disabled="gameData.gold < 200">
                召唤一次 (200💰)
            </button>
            <div v-if="gachaResult" class="gacha-result" :class="'quality-' + gachaResult.quality">
                {{ gachaResult.icon }} {{ gachaResult.name }}
            </div>
        </div>
    </div>
</template>
```

- [ ] **Step 2: 实现抽卡逻辑**

```js
const gachaResult = ref(null);

function gacha() {
    if (gameData.value.gold < 200) return;
    gameData.value.gold -= 200;
    const roll = Math.random();
    let roleId;
    if (roll < 0.05) roleId = ROLES[3].id; // 牧师 5%
    else if (roll < 0.2) roleId = ROLES[2].id; // 弓手 15%
    else if (roll < 0.5) roleId = ROLES[1].id; // 法师 30%
    else roleId = ROLES[0].id; // 战士 50%

    const existing = gameData.value.heroes.find(h => h.roleId === roleId);
    if (existing) {
        existing.level++;
        gachaResult.value = { ...ROLES.find(r => r.id === roleId), quality: 2, name: '重复！等级+1' };
    } else {
        gameData.value.heroes.push({ roleId, level: 1, exp: 0 });
        gachaResult.value = ROLES.find(r => r.id === roleId);
    }
}
```

- [ ] **Step 3: 添加商店样式**

```css
.shop { padding: 10px; }
.gacha-section { text-align: center; padding: 20px; background: #16213e; border-radius: 12px; }
.btn-gacha { padding: 15px 30px; font-size: 18px; background: linear-gradient(135deg, #f59e0b, #ef4444); border: none; color: white; border-radius: 8px; cursor: pointer; }
.btn-gacha:disabled { opacity: 0.5; cursor: not-allowed; }
.gacha-result { margin-top: 15px; padding: 15px; border-radius: 8px; font-size: 24px; animation: pop 0.3s; }
@keyframes pop { 0% { transform: scale(0); } 100% { transform: scale(1); } }
```

- [ ] **Step 4: 浏览器验证**

攒够 200 金币后点击召唤，确认新角色出现在角色列表，重复角色等级提升。

---

## Task 9: 离线收益

**Files:**
- Modify: `js/game.js`
- Modify: `js/app.js`

- [ ] **Step 1: 实现离线收益计算（game.js）**

```js
function calculateOfflineRewards(gameData) {
    const now = Date.now();
    const elapsed = Math.min(now - gameData.lastOnline, 8 * 60 * 60 * 1000); // 最多 8 小时
    const seconds = elapsed / 1000;
    const battles = Math.floor(seconds / 3);
    const stage = STAGES.find(s => s.id === gameData.currentStage);
    const goldPerBattle = 10 + stage.difficulty * 5;
    return {
        gold: Math.floor(battles * goldPerBattle * 0.5), // 离线效率 50%
        battles
    };
}
```

- [ ] **Step 2: 启动时显示离线收益**

```js
// app.js setup()
onMounted(() => {
    const rewards = calculateOfflineRewards(gameData.value);
    if (rewards.battles > 0) {
        gameData.value.gold += rewards.gold;
        alert(`离线收益：获得 ${rewards.gold} 金币 (${rewards.battles} 场战斗)`);
    }
    gameData.value.lastOnline = Date.now();
    startBattle();
});
```

- [ ] **Step 3: 浏览器验证**

关闭浏览器等待几分钟后重新打开，确认弹窗显示离线收益。

---

## Task 10: UI 打磨与响应式

**Files:**
- Modify: `css/style.css`
- Modify: `index.html`

- [ ] **Step 1: 添加整体视觉优化**

```css
/* 品质边框发光效果 */
.quality-4, .quality-5 { box-shadow: 0 0 10px currentColor; }

/* 按钮悬停效果 */
button:hover { opacity: 0.9; transform: scale(1.02); }

/* 滚动条美化 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #0f3460; border-radius: 3px; }
```

- [ ] **Step 2: 添加关卡选择模态框**

```html
<template id="stage-select-template">
    <div v-if="showStageSelect" class="modal">
        <div class="modal-content">
            <h3>选择关卡</h3>
            <div v-for="stage in availableStages" :key="stage.id"
                 class="stage-option" @click="selectStage(stage)">
                {{ stage.name }}
            </div>
            <button @click="showStageSelect = false">取消</button>
        </div>
    </div>
</template>
```

- [ ] **Step 3: 添加模态框样式**

```css
.modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-content { background: #16213e; padding: 20px; border-radius: 12px; max-width: 90%; max-height: 80vh; overflow-y: auto; }
.stage-option { padding: 10px; margin: 5px 0; background: #0f3460; border-radius: 6px; cursor: pointer; }
.stage-option:hover { background: #1a4a8a; }
```

- [ ] **Step 4: 浏览器验证**

手机浏览器打开确认布局正常，关卡选择模态框可正常工作。

---

## 验证清单

- [ ] 挂机战斗每 3 秒触发，显示战利品
- [ ] 金币数值实时更新并持久化
- [ ] 角色卡片点击显示详情
- [ ] 装备强化消耗金币，属性提升
- [ ] 装备出售增加金币
- [ ] 抽卡获得新角色，重复角色升级
- [ ] 刷新页面数据不丢失
- [ ] 关闭浏览器后重开有离线收益
- [ ] 手机浏览器布局正常
