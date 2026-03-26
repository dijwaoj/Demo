// ===== 途径分组 =====
const PATHWAY_GROUPS = [
    { id: 'source_castle', name: '源堡三途径', icon: '🏰', color: '#a78bfa', pathways: ['fool', 'door', 'error'] },
    { id: 'mind', name: '心灵三途径', icon: '🧠', color: '#f472b6', pathways: ['audience', 'sun', 'white_tower'] },
    { id: 'nature', name: '自然三途径', icon: '🌿', color: '#4ade80', pathways: ['mother', 'moon', 'tyrant'] },
    { id: 'war', name: '战争三途径', icon: '⚔️', color: '#ef4444', pathways: ['red_priest', 'hunter', 'witch'] },
    { id: 'death', name: '死亡三途径', icon: '💀', color: '#6366f1', pathways: ['darkness', 'death', 'hanged_man'] },
    { id: 'abyss', name: '深渊三途径', icon: '👹', color: '#78716c', pathways: ['monster', 'prisoner', 'demon'] },
    { id: 'order', name: '秩序三途径', icon: '👑', color: '#f59e0b', pathways: ['lawyer', 'arbiter', 'reader'] }
];

// ===== 途径数据 =====
const PATHWAYS = [
    {
        id: 'fool', group: 'source_castle', name: '占卜家途径', icon: '🃏', color: '#a78bfa',
        god: '克莱恩', ability: '预言·秘偶操控·命运干涉',
        sequences: ['占卜家', '小丑', '魔术师', '无面人', '秘偶大师', '诡法师', '古代学者', '奇迹师', '诡秘侍者', '愚者'],
        baseStats: { hp: 100, atk: 18, def: 8, crit: 12 }
    },
    {
        id: 'door', group: 'source_castle', name: '学徒途径', icon: '🚪', color: '#818cf8',
        god: '贝尔纳黛', ability: '空间传送·开门·记录法术',
        sequences: ['学徒', '戏法大师', '占星人', '记录官', '旅行家', '秘法师', '漫游者', '旅法师', '星之匙', '门'],
        baseStats: { hp: 90, atk: 20, def: 6, crit: 15 }
    },
    {
        id: 'error', group: 'source_castle', name: '偷盗者途径', icon: '🐛', color: '#c084fc',
        god: '阿蒙', ability: '窃取概念·欺诈·时间操控',
        sequences: ['偷盗者', '诈骗师', '解密学者', '盗火人', '窃梦家', '寄生者', '欺瞒导师', '命运木马', '时之虫', '错误'],
        baseStats: { hp: 85, atk: 22, def: 5, crit: 18 }
    },
    {
        id: 'audience', group: 'mind', name: '观众途径', icon: '👁️', color: '#f472b6',
        god: '亚当', ability: '读心·催眠·梦境操控',
        sequences: ['观众', '读心者', '心理医生', '催眠师', '梦境行者', '操纵师', '织梦人', '洞察者', '作家', '空想家'],
        baseStats: { hp: 80, atk: 15, def: 10, crit: 10 }
    },
    {
        id: 'sun', group: 'mind', name: '歌颂者途径', icon: '☀️', color: '#fbbf24',
        god: '奥赛库斯', ability: '光明·净化·神圣之力',
        sequences: ['歌颂者', '祈光人', '太阳神官', '公证人', '光之祭司', '无暗者', '正义导师', '逐光者', '纯白天使', '太阳'],
        baseStats: { hp: 110, atk: 14, def: 12, crit: 8 }
    },
    {
        id: 'white_tower', group: 'mind', name: '阅读者途径', icon: '📚', color: '#a3e635',
        god: '赫拉伯根', ability: '知识·推理·全知',
        sequences: ['阅读者', '推理学员', '守知者', '博学者', '秘术导师', '预言家', '洞悉者', '智天使', '全知之眼', '白塔'],
        baseStats: { hp: 85, atk: 16, def: 9, crit: 14 }
    },
    {
        id: 'mother', group: 'nature', name: '耕种者途径', icon: '🌾', color: '#4ade80',
        god: '莉莉丝', ability: '生命·自然·丰收',
        sequences: ['耕种者', '园艺师', '大地母神信徒', '德鲁伊', '自然行者', '大地祭司', '母神之子', '生命学派', '丰收天使', '母亲'],
        baseStats: { hp: 130, atk: 12, def: 14, crit: 6 }
    },
    {
        id: 'moon', group: 'nature', name: '药师途径', icon: '🌙', color: '#f9a8d4',
        god: '埃姆林', ability: '药剂·毒素·血族能力',
        sequences: ['药师', '驯兽师', '吸血鬼', '女巫', '魔药教授', '深红学者', '巫王', '召唤大师', '血族伯爵', '月亮'],
        baseStats: { hp: 95, atk: 17, def: 8, crit: 16 }
    },
    {
        id: 'tyrant', group: 'nature', name: '水手途径', icon: '🌊', color: '#22d3d1',
        god: '列奥德罗', ability: '风暴·雷电·海洋',
        sequences: ['水手', '暴怒之民', '航海家', '风眷者', '海洋歌者', '灾难主祭', '海王', '天灾', '雷神', '暴君'],
        baseStats: { hp: 105, atk: 20, def: 10, crit: 10 }
    },
    {
        id: 'red_priest', group: 'war', name: '红祭司途径', icon: '🔥', color: '#ef4444',
        god: '因斯·赞格威尔', ability: '战斗·战争·毁灭',
        sequences: ['战士', '格斗家', '武器大师', '黎明骑士', '守护者', '铁血骑士', '战争主教', '秩序之刃', '毁灭者', '红祭司'],
        baseStats: { hp: 120, atk: 22, def: 12, crit: 8 }
    },
    {
        id: 'hunter', group: 'war', name: '猎人途径', icon: '🏹', color: '#f97316',
        god: '罗塞尔', ability: '狩猎·追踪·征服',
        sequences: ['猎人', '追踪者', '挑衅者', '纵火家', '阴谋家', '收割者', '铁血骑士', '战争主教', '征服者', '征服者'],
        baseStats: { hp: 95, atk: 24, def: 7, crit: 15 }
    },
    {
        id: 'witch', group: 'war', name: '魔女途径', icon: '🧙‍♀️', color: '#e879f9',
        god: '特莉丝', ability: '魅惑·痛苦·瘟疫',
        sequences: ['刺客', '教唆者', '女巫', '欢愉魔女', '痛苦魔女', '绝望魔女', '瘟疫魔女', '欲望使徒', '魔鬼', '魔女'],
        baseStats: { hp: 80, atk: 20, def: 6, crit: 20 }
    },
    {
        id: 'darkness', group: 'death', name: '不眠者途径', icon: '🌑', color: '#6366f1',
        god: '黑夜女神', ability: '黑夜·恐惧·隐秘',
        sequences: ['不眠者', '午夜诗人', '梦魇', '安魂师', '灵巫', '守夜人', '恐惧主教', '隐秘之仆', '厄难骑士', '黑暗'],
        baseStats: { hp: 90, atk: 18, def: 8, crit: 14 }
    },
    {
        id: 'death', group: 'death', name: '收尸人途径', icon: '💀', color: '#a1a1aa',
        god: '冥皇', ability: '死亡·死灵·通灵',
        sequences: ['收尸人', '掘墓人', '通灵者', '死灵导师', '摆渡人', '死亡执政官', '苍白皇帝', '亡灵导师', '亡者之主', '死神'],
        baseStats: { hp: 100, atk: 16, def: 10, crit: 10 }
    },
    {
        id: 'hanged_man', group: 'death', name: '秘祈人途径', icon: '🩸', color: '#7c2d12',
        god: '亚伯拉罕', ability: '隐秘·堕落·赎罪',
        sequences: ['秘祈人', '倾听者', '隐修士', '蔷薇主教', '黑骑士', '赎罪者', '污秽导师', '地狱骑士', '堕落男爵', '倒吊人'],
        baseStats: { hp: 95, atk: 19, def: 9, crit: 12 }
    },
    {
        id: 'monster', group: 'abyss', name: '异种途径', icon: '👾', color: '#78716c',
        god: '未知', ability: '变形·混沌·野兽',
        sequences: ['怪物', '异种', '梦魇', '变形者', '兽语者', '野兽主教', '兽皇', '异种之王', '混沌之子', '异种'],
        baseStats: { hp: 110, atk: 18, def: 8, crit: 12 }
    },
    {
        id: 'prisoner', group: 'abyss', name: '囚犯途径', icon: '⛓️', color: '#57534e',
        god: '未知', ability: '束缚·痛苦·疯狂',
        sequences: ['囚犯', '疯子', '自残者', '狂人', '虐待狂', '受虐狂', '施虐狂', '痛苦骑士', '受缚之主', '被缚者'],
        baseStats: { hp: 100, atk: 20, def: 7, crit: 15 }
    },
    {
        id: 'demon', group: 'abyss', name: '罪犯途径', icon: '😈', color: '#991b1b',
        god: '未知', ability: '犯罪·欺诈·深渊',
        sequences: ['罪犯', '恶棍', '欺诈师', '恶魔', '欲望使徒', '魔鬼', '深渊主教', '地狱领主', '混沌之子', '恶魔'],
        baseStats: { hp: 90, atk: 22, def: 6, crit: 18 }
    },
    {
        id: 'lawyer', group: 'order', name: '律师途径', icon: '⚖️', color: '#f59e0b',
        god: '罗塞尔', ability: '法律·秩序·惩戒',
        sequences: ['律师', '辩论家', '贿赂者', '腐化男爵', '混乱导师', '堕落伯爵', '狂乱法师', '熵之公爵', '秩序主教', '黑皇帝'],
        baseStats: { hp: 95, atk: 16, def: 12, crit: 10 }
    },
    {
        id: 'arbiter', group: 'order', name: '仲裁人途径', icon: '🏛️', color: '#d97706',
        god: '亚当', ability: '仲裁·秩序·律令',
        sequences: ['仲裁人', '治安官', '审讯者', '法官', '惩戒骑士', '律令法师', '秩序之手', '立法者', '秩序主教', '完美者'],
        baseStats: { hp: 115, atk: 15, def: 14, crit: 8 }
    },
    {
        id: 'reader', group: 'order', name: '通识者途径', icon: '🔍', color: '#84cc16',
        god: '赫拉伯根', ability: '知识·机械·窥秘',
        sequences: ['通识者', '机械专家', '发明家', '考古学家', '解密专家', '占星人', '星术师', '预言家', '窥秘人', '知识与智慧之神'],
        baseStats: { hp: 85, atk: 18, def: 8, crit: 16 }
    }
];

// ===== 品质与关卡数据 =====
const QUALITY_NAMES = ['普通', '优秀', '精良', '史诗', '传说'];
const QUALITY_COLORS = { 1: '#fff', 2: '#4ade80', 3: '#60a5fa', 4: '#a78bfa', 5: '#fb923c' };
const EQUIP_TYPES = ['weapon', 'armor', 'accessory'];
const EQUIP_TYPE_NAMES = { weapon: '武器', armor: '防具', accessory: '饰品' };

// 关卡数据
const STAGES = [];
for (let chapter = 1; chapter <= 3; chapter++) {
    for (let level = 1; level <= 10; level++) {
        let type = 'normal', icon = '', dropBonus = 1;
        if (level === 3) { type = 'elite'; icon = '💀'; dropBonus = 1.5; }
        else if (level === 5) { type = 'boss'; icon = '👹'; dropBonus = 2; }
        else if (level === 10) { type = 'bigboss'; icon = '🐉'; dropBonus = 3; }
        STAGES.push({
            id: `${chapter}-${level}`, name: `第${chapter}章 第${level}关`,
            chapter, level, type, icon, dropBonus,
            difficulty: (chapter - 1) * 10 + level,
            hp: Math.floor((50 + (chapter - 1) * 200 + level * 20) * (type === 'bigboss' ? 3 : type === 'boss' ? 2 : type === 'elite' ? 1.5 : 1)),
            atk: Math.floor((5 + (chapter - 1) * 10 + level * 2) * (type === 'bigboss' ? 2.5 : type === 'boss' ? 1.8 : type === 'elite' ? 1.3 : 1))
        });
    }
}

// 辅助函数
function getPathway(id) { return PATHWAYS.find(p => p.id === id); }
function getPathwayGroup(id) { return PATHWAY_GROUPS.find(g => g.id === id); }
function getSequenceName(pathway, seq) { return pathway ? pathway.sequences[9 - seq] || '未知' : '未知'; }
