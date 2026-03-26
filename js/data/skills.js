// ===== 技能生成系统 =====
// 根据途径和序列自动生成技能

const SKILL_TEMPLATES = {
    // 被动技能效果模板
    passive: [
        { type: 'atk_pct', name: '强化攻击', desc: '攻击力提升{value}%' },
        { type: 'def_pct', name: '强化防御', desc: '防御力提升{value}%' },
        { type: 'hp_pct', name: '生命强化', desc: '生命值提升{value}%' },
        { type: 'crit_pct', name: '暴击强化', desc: '暴击率提升{value}%' }
    ],
    // 主动技能效果模板
    active: [
        { type: 'damage', name: '强力一击', desc: '造成{value}%攻击力伤害', cooldown: 5 },
        { type: 'heal', name: '治愈术', desc: '恢复{value}%生命值', cooldown: 8 },
        { type: 'dot', name: '持续伤害', desc: '每秒造成{value}%攻击力伤害，持续3秒', cooldown: 10 },
        { type: 'shield', name: '护盾', desc: '吸收{value}%生命值的伤害', cooldown: 12 }
    ],
    // 大招效果模板 (序列<=5)
    ultimate: [
        { type: 'damage', name: '终极打击', desc: '造成{value}%攻击力伤害', cooldown: 30, isUltimate: true }
    ]
};

// 途径专属技能名称
const PATHWAY_SKILL_NAMES = {
    fool: ['冥想', '灵视', '占卜', '命运之线', '空间跳跃', '历史影像', '愿望实现', '时空扭曲', '愚弄权柄'],
    door: ['空间感知', '瞬移', '传送门', '维度撕裂', '星界穿梭', '世界之门'],
    error: ['窃取', '欺诈', '时间窃取', '命运篡改', '错误代码'],
    audience: ['读心', '催眠', '梦境编织', '意识入侵', '空想成真'],
    sun: ['圣光', '净化', '神圣审判', '天使降临', '太阳风暴'],
    white_tower: ['知识之光', '全知之眼', '真理显现', '智慧光环'],
    mother: ['生命赐福', '自然之力', '丰收祝福', '生命创造'],
    moon: ['月光治愈', '血族之力', '猩红领域', '永恒之夜'],
    tyrant: ['风暴', '雷电', '海啸', '天灾降临'],
    red_priest: ['战争号角', '毁灭打击', '铁血领域', '红祭司之怒'],
    hunter: ['追踪', '火焰陷阱', '收割', '征服者之威'],
    witch: ['魅惑', '痛苦诅咒', '瘟疫传播', '魔女之吻'],
    darkness: ['夜幕降临', '恐惧之眼', '暗影吞噬', '永恒黑暗'],
    death: ['亡灵召唤', '灵魂收割', '苍白之触', '死神降临'],
    hanged_man: ['堕落之触', '污秽领域', '地狱之火', '倒吊人之罚'],
    monster: ['变形', '野性狂暴', '异种之力', '混沌风暴'],
    prisoner: ['痛苦枷锁', '疯狂之怒', '束缚之力', '被缚者之痛'],
    demon: ['恶魔之火', '深渊吞噬', '地狱烈焰', '恶魔咆哮'],
    lawyer: ['规则扭曲', '秩序崩塌', '混乱领域', '黑皇帝之令'],
    arbiter: ['审判', '秩序之剑', '律令制裁', '完美者之裁'],
    reader: ['知识具现', '机械造物', '星象之力', '全知者之智']
};

// 动画名称映射
const ULTIMATE_ANIMATIONS = {
    fool: 'spatial_rift',
    door: 'dimension_door',
    error: 'time_theft',
    audience: 'dream_weave',
    sun: 'holy_descent',
    white_tower: 'wisdom_light',
    mother: 'life_bloom',
    moon: 'blood_moon',
    tyrant: 'storm_fury',
    red_priest: 'flame_storm',
    hunter: 'fire_trap',
    witch: 'plague_spread',
    darkness: 'dark_devour',
    death: 'death_reaper',
    hanged_man: 'hell_fire',
    monster: 'chaos_storm',
    prisoner: 'pain_chains',
    demon: 'demon_roar',
    lawyer: 'order_collapse',
    arbiter: 'divine_judgment',
    reader: 'star_power'
};

// 生成技能数据
function generateSkills() {
    const skills = [];
    
    PATHWAYS.forEach(pathway => {
        const pathwayId = pathway.id;
        const skillNames = PATHWAY_SKILL_NAMES[pathwayId] || ['通用技能'];
        
        for (let seq = 9; seq >= 0; seq--) {
            // 每个序列2-3个技能
            const skillCount = seq <= 5 ? 3 : 2;
            
            for (let i = 0; i < skillCount; i++) {
                const skillId = `${pathwayId}_${seq}_${i + 1}`;
                const isUltimate = seq <= 5 && i === skillCount - 1; // 序列5以下最后一个技能是大招
                const isActive = !isUltimate && i === 1; // 第二个技能是主动
                
                // 计算效果值 (序列越低越强)
                const baseValue = Math.floor((10 - seq) * 5 + 5); // 序列9:10, 序列0:55
                
                let skill;
                if (isUltimate) {
                    const template = SKILL_TEMPLATES.ultimate[0];
                    skill = {
                        id: skillId,
                        pathway: pathwayId,
                        seq: seq,
                        name: skillNames[Math.min(seq, skillNames.length - 1)] || `${pathway.sequences[9 - seq]}之力`,
                        type: 'ultimate',
                        effect: { type: 'damage', value: baseValue * 5 },
                        desc: template.desc.replace('{value}', baseValue * 5),
                        cooldown: 30,
                        animation: ULTIMATE_ANIMATIONS[pathwayId] || 'default'
                    };
                } else if (isActive) {
                    const template = SKILL_TEMPLATES.active[i % SKILL_TEMPLATES.active.length];
                    skill = {
                        id: skillId,
                        pathway: pathwayId,
                        seq: seq,
                        name: skillNames[Math.min(seq + 3, skillNames.length - 1)] || template.name,
                        type: 'active',
                        effect: { type: template.type, value: baseValue * 2 },
                        desc: template.desc.replace('{value}', baseValue * 2),
                        cooldown: template.cooldown
                    };
                } else {
                    const template = SKILL_TEMPLATES.passive[i % SKILL_TEMPLATES.passive.length];
                    skill = {
                        id: skillId,
                        pathway: pathwayId,
                        seq: seq,
                        name: skillNames[Math.min(seq + 6, skillNames.length - 1)] || template.name,
                        type: 'passive',
                        effect: { type: template.type, value: baseValue },
                        desc: template.desc.replace('{value}', baseValue)
                    };
                }
                
                skills.push(skill);
            }
        }
    });
    
    return skills;
}

// 生成所有技能
const SKILLS = generateSkills();

// 辅助函数
function getSkillsByPathway(pathwayId) {
    return SKILLS.filter(s => s.pathway === pathwayId);
}

function getSkillsBySequence(pathwayId, seq) {
    return SKILLS.filter(s => s.pathway === pathwayId && s.seq === seq);
}

function getHeroSkills(hero) {
    const pathway = getPathway(hero.pathway);
    if (!pathway) return [];
    return getSkillsBySequence(hero.pathway, hero.sequence);
}

function getPassiveEffects(hero) {
    const skills = getHeroSkills(hero).filter(s => s.type === 'passive');
    const effects = { atk_pct: 0, def_pct: 0, hp_pct: 0, crit_pct: 0 };
    skills.forEach(s => {
        if (effects[s.effect.type] !== undefined) {
            effects[s.effect.type] += s.effect.value;
        }
    });
    return effects;
}
