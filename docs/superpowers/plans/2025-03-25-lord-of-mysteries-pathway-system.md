# 诡秘之主途径系统 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构游戏为诡秘之主途径系统，包含22条途径、序列晋升、战斗动画、Canvas大招特效、独立角色进度。

**Architecture:** Vue 3 CDN单页面应用，按页面分文件夹，数据与逻辑分离，Canvas粒子特效。

**Tech Stack:** Vue 3 (CDN), Canvas 2D, localStorage, Vanilla CSS

---

## 文件结构

```
my-game/
├── index.html                    # 入口+路由容器
├── css/
│   ├── main.css                  # 全局样式+布局
│   ├── battle.css                # 战斗界面样式
│   └── ui.css                    # 通用组件样式
├── js/
│   ├── data/
│   │   ├── pathways.js           # 22条途径+分组
│   │   ├── skills.js             # 全部技能数据（220个）
│   │   └── stages.js             # 关卡数据
│   ├── core/
│   │   ├── game.js               # 存档/读档/迁移
│   │   ├── battle.js             # 战斗逻辑
│   │   └── inventory.js          # 背包逻辑
│   ├── effects/
│   │   └── particles.js          # Canvas粒子特效系统
│   ├── pages/
│   │   ├── adventure/
│   │   │   └── adventure.js      # 冒险页组件
│   │   ├── heroes/
│   │   │   └── heroes.js         # 角色页组件
│   │   ├── inventory/
│   │   │   └── inventory.js      # 背包页组件
│   │   └── shop/
│   │       └── shop.js           # 商店页组件
│   └── app.js                    # Vue主应用+路由
```

---

## Task 1: 途径数据层

**Files:**
- Create: `js/data/pathways.js`
- Create: `js/data/stages.js`

- [ ] **Step 1: 创建途径分组数据**

```js
const PATHWAY_GROUPS = [
    { id: 'source_castle', name: '源堡三途径', icon: '🏰', color: '#a78bfa', pathways: ['fool', 'door', 'error'] },
    { id: 'mind', name: '心灵三途径', icon: '🧠', color: '#f472b6', pathways: ['audience', 'sun', 'white_tower'] },
    { id: 'nature', name: '自然三途径', icon: '🌿', color: '#4ade80', pathways: ['mother', 'moon', 'tyrant'] },
    { id: 'war', name: '战争三途径', icon: '⚔️', color: '#ef4444', pathways: ['red_priest', 'hunter', 'witch'] },
    { id: 'death', name: '死亡三途径', icon: '💀', color: '#6366f1', pathways: ['darkness', 'death', 'hanged_man'] },
    { id: 'abyss', name: '深渊三途径', icon: '👹', color: '#78716c', pathways: ['monster', 'prisoner', 'demon'] },
    { id: 'order', name: '秩序三途径', icon: '👑', color: '#f59e0b', pathways: ['lawyer', 'arbiter', 'reader'] }
];
```

- [ ] **Step 2: 创建22条途径基础数据**

每条途径包含：id, group, name, icon, color, god, ability_summary, sequences数组

sequences数组每项包含：level(9-0), name, skills数组引用

完整数据见用户提供的22条途径列表。

- [ ] **Step 3: 创建关卡数据（复用现有STAGES）**

- [ ] **Step 4: 浏览器控制台验证**

输入PATHWAY_GROUPS.length应为7，PATHWAYS.length应为22

---

## Task 2: 技能数据层

**Files:**
- Create: `js/data/skills.js`

- [ ] **Step 1: 创建技能数据结构**

```js
const SKILLS = [
    // 愚者途径
    { id: 'fool_9_1', pathway: 'fool', seq: 9, name: '冥想', type: 'passive', effect: { type: 'atk_pct', value: 10 }, desc: '提升10%攻击力' },
    { id: 'fool_9_2', pathway: 'fool', seq: 9, name: '灵视', type: 'active', effect: { type: 'crit_pct', value: 20, duration: 5 }, desc: '5秒内暴击率+20%', cooldown: 10 },
    { id: 'fool_8_1', pathway: 'fool', seq: 8, name: '战斗直觉', type: 'passive', effect: { type: 'atk_pct', value: 15 }, desc: '提升15%攻击力' },
    // ... 每个序列2-3个技能
    // 序列5以下有ultimate类型
    { id: 'fool_4_1', pathway: 'fool', seq: 4, name: '不死', type: 'passive', effect: { type: 'hp_pct', value: 50 }, desc: '生命+50%' },
    { id: 'fool_4_2', pathway: 'fool', seq: 4, name: '空间跳跃', type: 'ultimate', effect: { type: 'damage', value: 300 }, desc: '空间撕裂造成300%伤害', cooldown: 30, animation: 'spatial_rift' },
];
```

- [ ] **Step 2: 填写22条途径完整技能**

每条途径10个序列，每个序列2-3个技能，共约220个技能

effect.type类型：
- `atk_pct` - 攻击力百分比加成
- `def_pct` - 防御力百分比加成
- `hp_pct` - 生命值百分比加成
- `crit_pct` - 暴击率加成
- `damage` - 造成X%攻击力伤害
- `heal` - 恢复X%生命值
- `dot` - 持续伤害
- `shield` - 护盾

- [ ] **Step 3: 浏览器控制台验证**

输入SKILLS.length应约为220

---

## Task 3: 项目结构重构

**Files:**
- Create: `css/main.css`
- Create: `css/battle.css`
- Create: `css/ui.css`
- Create: `js/core/game.js`
- Create: `js/core/battle.js`
- Create: `js/core/inventory.js`
- Create: `js/pages/adventure/adventure.js`
- Create: `js/pages/heroes/heroes.js`
- Create: `js/pages/inventory/inventory.js`
- Create: `js/pages/shop/shop.js`
- Modify: `index.html`

- [ ] **Step 1: 创建CSS文件**

`css/main.css`: 全局样式（复用现有style.css内容）

`css/battle.css`: 战斗界面样式

```css
.battle-container { position: relative; height: 400px; background: #0f3460; border-radius: 12px; overflow: hidden; }
.battle-side { position: absolute; top: 50%; transform: translateY(-50%); text-align: center; }
.battle-hero { left: 20px; }
.battle-enemy { right: 20px; }
.battle-sprite { font-size: 64px; transition: transform 0.3s; }
.battle-sprite.attacking { animation: attack 0.3s; }
@keyframes attack { 0% { transform: translateX(0); } 50% { transform: translateX(30px); } 100% { transform: translateX(0); } }
.hp-bar { width: 120px; height: 12px; background: #333; border-radius: 6px; margin: 8px auto; overflow: hidden; }
.hp-fill { height: 100%; background: #4ade80; transition: width 0.3s; }
.hp-fill.low { background: #ef4444; }
.damage-num { position: absolute; font-size: 20px; font-weight: bold; color: #fbbf24; animation: floatUp 1s forwards; pointer-events: none; }
@keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-60px); } }
.skill-bar { display: flex; gap: 8px; justify-content: center; padding: 10px; }
.skill-btn { width: 60px; height: 60px; border-radius: 8px; background: #16213e; border: 2px solid #0f3460; color: white; cursor: pointer; position: relative; }
.skill-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.skill-btn .cooldown { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; border-radius: 6px; }
.skill-btn.ultimate { border-color: #fb923c; box-shadow: 0 0 10px #fb923c; }
#battle-canvas { position: absolute; inset: 0; pointer-events: none; }
```

`css/ui.css`: 通用组件样式（按钮、卡片、模态框等）

- [ ] **Step 2: 创建核心逻辑文件**

`js/core/game.js`: 存档系统（迁移自现有game.js）

`js/core/battle.js`: 战斗计算逻辑

`js/core/inventory.js`: 背包逻辑（复用现有）

- [ ] **Step 3: 创建页面组件文件**

每个页面组件导出一个Vue组件对象，包含template和setup

- [ ] **Step 4: 更新index.html加载所有新文件**

```html
<script src="js/data/pathways.js"></script>
<script src="js/data/skills.js"></script>
<script src="js/data/stages.js"></script>
<script src="js/core/game.js"></script>
<script src="js/core/battle.js"></script>
<script src="js/core/inventory.js"></script>
<script src="js/effects/particles.js"></script>
<script src="js/pages/adventure/adventure.js"></script>
<script src="js/pages/heroes/heroes.js"></script>
<script src="js/pages/inventory/inventory.js"></script>
<script src="js/pages/shop/shop.js"></script>
<script src="js/app.js"></script>
```

- [ ] **Step 5: 浏览器验证页面能加载**

---

## Task 4: 存档系统升级

**Files:**
- Modify: `js/core/game.js`

- [ ] **Step 1: 新存档结构**

```js
const DEFAULT_SAVE = {
    gold: 100,
    material: 0, // 灵性碎片（通用材料）
    heroes: [
        {
            id: 'hero_1',
            pathway: 'fool',
            sequence: 9,
            level: 1,
            exp: 0,
            currentStage: '1-1',
            maxStage: '1-1',
            equipment: { weapon: null, armor: null, accessory: null },
            activeSkills: ['fool_9_1', 'fool_9_2'], // 当前激活的技能
            cooldowns: {} // 技能冷却
        }
    ],
    activeHeroId: 'hero_1', // 当前选中的角色
    inventory: [],
    lastOnline: Date.now()
};
```

- [ ] **Step 2: 迁移旧存档**

检测旧格式，自动转换为新格式。默认创建一个愚者途径的初始角色。

- [ ] **Step 3: 浏览器验证**

清除localStorage后刷新，确认新存档结构正确

---

## Task 5: 角色系统

**Files:**
- Create: `js/pages/heroes/heroes.js`
- Modify: `js/app.js`

- [ ] **Step 1: 角色页组件**

包含：
- 角色列表（显示途径图标+序列名+等级）
- 点击切换当前角色
- 添加新角色按钮（打开途径选择）
- 角色详情（属性、技能、装备、晋升）

- [ ] **Step 2: 途径选择流程**

点击添加角色→选择分组→选择途径→创建角色（序列9）

- [ ] **Step 3: 晋升系统**

显示当前序列和下一序列，需要的材料数量

晋升按钮（检查材料是否足够）

- [ ] **Step 4: 浏览器验证**

能切换角色、添加新角色、查看角色详情

---

## Task 6: 冒险页重构

**Files:**
- Create: `js/pages/adventure/adventure.js`

- [ ] **Step 1: 冒险页组件**

包含：
- 当前角色信息栏（途径+序列名+切换按钮）
- 关卡网格（5列，按章节分组）
- 自动闯关按钮
- 战斗入口

- [ ] **Step 2: 关卡独立进度**

每个角色独立的currentStage和maxStage

点击关卡进入战斗界面

- [ ] **Step 3: 浏览器验证**

切换角色后关卡进度不同

---

## Task 7: 战斗系统

**Files:**
- Create: `js/core/battle.js`
- Modify: `js/pages/adventure/adventure.js`

- [ ] **Step 1: 战斗界面**

点击关卡后显示战斗画面：
- 左侧：英雄血条+头像
- 右侧：怪物血条+头像
- 底部：技能按钮（普通技能+大招）
- 中间：Canvas粒子层

- [ ] **Step 2: 战斗逻辑**

```js
function startBattle(hero, stage, onEnd) {
    const heroHp = { current: heroMaxHp(hero), max: heroMaxHp(hero) };
    const enemyHp = { current: stage.hp, max: stage.hp };
    const passiveEffects = getPassiveEffects(hero); // 计算被动叠加
    const autoAttackInterval = setInterval(() => {
        // 自动攻击
        const dmg = calcDamage(hero, stage, passiveEffects);
        enemyHp.current -= dmg;
        showDamageNum(dmg, 'enemy');
        // 敌人反击
        const enemyDmg = calcEnemyDamage(stage, hero, passiveEffects);
        heroHp.current -= enemyDmg;
        showDamageNum(enemyDmg, 'hero');
        // 检查胜负
        if (enemyHp.current <= 0) { clearInterval(); onEnd('win'); }
        if (heroHp.current <= 0) { clearInterval(); onEnd('lose'); }
    }, 2000);
    return { heroHp, enemyHp, autoAttackInterval, useSkill };
}
```

- [ ] **Step 3: 技能释放**

点击技能按钮→检查冷却→执行效果→播放动画→进入冷却

大招按钮更炫（发光边框），点击播放Canvas粒子特效

- [ ] **Step 4: 伤害飘字**

战斗画面上浮动显示伤害数字

- [ ] **Step 5: 浏览器验证**

能进入战斗、看到攻击动画、释放技能、显示伤害

---

## Task 8: Canvas粒子特效

**Files:**
- Create: `js/effects/particles.js`

- [ ] **Step 1: 粒子系统基类**

```js
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.running = false;
    }
    add(particle) { this.particles.push(particle); }
    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.life--;
            p.draw(this.ctx);
        });
    }
    run(duration) {
        this.running = true;
        const start = Date.now();
        const loop = () => {
            this.update();
            if (Date.now() - start < duration && this.running) requestAnimationFrame(loop);
            else this.running = false;
        };
        loop();
    }
    stop() { this.running = false; }
}
```

- [ ] **Step 2: 预设特效**

```js
const EFFECTS = {
    spatial_rift: (canvas) => {
        // 愚者大招：空间撕裂 - 蓝紫色漩涡+星辰碎片
        const ps = new ParticleSystem(canvas);
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            ps.add({ x: canvas.width/2, y: canvas.height/2, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 60, color: `hsl(${260+Math.random()*40}, 80%, 60%)`, size: Math.random()*4+2 });
        }
        ps.run(2000);
    },
    holy_descent: (canvas) => {
        // 太阳大招：天使降临 - 金色光柱+圣光粒子
    },
    dark_devour: (canvas) => {
        // 黑暗大招：暗影吞噬 - 黑色漩涡+恐惧之眼
    },
    flame_storm: (canvas) => {
        // 红祭司大招：烈焰风暴 - 红色火焰+爆炸粒子
    },
    // ... 每条途径一个大招特效
};
```

- [ ] **Step 3: 集成到战斗系统**

释放大招时调用对应特效

- [ ] **Step 4: 浏览器验证**

释放大招能看到Canvas粒子动画

---

## Task 9: 背包页重构

**Files:**
- Create: `js/pages/inventory/inventory.js`

- [ ] **Step 1: 背包页组件**

包含：
- 装备列表（按途径+品质排序）
- 材料显示（灵性碎片数量）
- 装备操作（装备/强化/出售）

- [ ] **Step 2: 装备名称根据途径**

装备显示对应途径的名称（如愚者途径的武器叫"占卜水晶"）

- [ ] **Step 3: 浏览器验证**

背包显示正确，装备操作正常

---

## Task 10: 商店页重构

**Files:**
- Create: `js/pages/shop/shop.js`

- [ ] **Step 1: 商店页组件**

包含：
- 选择途径（7组分组展示）
- 选择具体途径
- 抽卡按钮（单抽/10连/最大）
- 抽卡结果展示

- [ ] **Step 2: 抽卡逻辑**

选择途径后，抽到的角色一定是该途径的序列9

重复角色→晋升材料+1

- [ ] **Step 3: 浏览器验证**

选途径→抽卡→获得对应途径角色

---

## Task 11: 主应用整合

**Files:**
- Modify: `js/app.js`
- Modify: `index.html`

- [ ] **Step 1: 主应用路由**

使用Vue的component动态组件切换页面

- [ ] **Step 2: 底部导航更新**

冒险、角色、背包、商店四个Tab

- [ ] **Step 3: 全局状态**

activeHero、gold、material等全局数据

- [ ] **Step 4: 浏览器验证**

四个页面切换正常，数据联动正确

---

## Task 12: 测试与修复

- [ ] **Step 1: 完整流程测试**

创建角色→冒险→获得装备→装备角色→晋升→抽新角色→切换角色

- [ ] **Step 2: 战斗系统测试**

进入战斗→自动攻击→释放技能→释放大招→战斗结束

- [ ] **Step 3: 边界测试**

材料不足时晋升失败、冷却中不能释放技能、切换角色后进度正确

- [ ] **Step 4: 修复发现的问题**

---

## 验证清单

- [ ] 22条途径正确显示
- [ ] 选择途径创建角色
- [ ] 每个角色独立关卡进度
- [ ] 切换角色后进度不同
- [ ] 战斗有动画效果
- [ ] 技能释放有冷却
- [ ] 大招有Canvas粒子特效
- [ ] 伤害飘字显示
- [ ] BOSS关掉落灵性碎片
- [ ] 晋升消耗材料正确
- [ ] 晋升后序列名改变+新技能解锁
- [ ] 装备名称随途径变化
- [ ] 抽卡选择途径获得对应角色
- [ ] 存档持久化正常
- [ ] 移动端布局正常
