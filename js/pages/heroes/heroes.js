const HeroesPage = {
    template: `
        <div>
            <div class="heroes">
                <div v-for="hero in gameData.heroes" :key="hero.roleId"
                     class="hero-card" :class="'quality-1'"
                     @click="selectedHero = hero">
                    <div class="hero-icon">{{ getRole(hero.roleId).icon }}</div>
                    <div class="hero-info">
                        <h4>{{ getRole(hero.roleId).name }}</h4>
                        <p>Lv.{{ hero.level }}</p>
                    </div>
                </div>
                <div v-if="!gameData.heroes.length" class="empty-state">暂无角色</div>
            </div>
            <div v-if="selectedHero" class="modal" @click.self="selectedHero = null">
                <div class="hero-detail">
                    <h3>{{ getRole(selectedHero.roleId).name }} Lv.{{ selectedHero.level }}</h3>
                    <div class="stat-row"><span>HP</span><span>{{ getHeroTotalStat(selectedHero, 'hp') }}</span></div>
                    <div class="stat-row"><span>攻击</span><span>{{ getHeroTotalStat(selectedHero, 'atk') }}</span></div>
                    <div class="stat-row"><span>防御</span><span>{{ getHeroTotalStat(selectedHero, 'def') }}</span></div>
                    <div class="stat-row"><span>暴击</span><span>{{ getRole(selectedHero.roleId).crit }}%</span></div>
                    <h4 style="margin-top: 12px; margin-bottom: 8px;">装备</h4>
                    <div v-for="slot in ['weapon', 'armor', 'accessory']" :key="slot" class="equip-slot">
                        <span class="slot-label">{{ getEquipTypeLabel(slot) }}</span>
                        <span v-if="selectedHero.equipment[slot]" class="slot-item" :style="{ color: getQualityColor(selectedHero.equipment[slot].quality) }">
                            {{ selectedHero.equipment[slot].name }} (+{{ selectedHero.equipment[slot].bonus }})
                            <button @click="unequipFromHero(selectedHero, slot)" class="btn-xs">卸下</button>
                        </span>
                        <span v-else class="slot-empty">空</span>
                    </div>
                    <button @click="autoEquipAll()" class="btn btn-autoequip" style="margin-top: 10px; width: 100%;">一键装备</button>
                    <button @click="selectedHero = null" class="btn" style="margin-top: 8px; width: 100%;">关闭</button>
                </div>
            </div>
        </div>
    `,
    setup() {
        const { ref, inject } = Vue;
        const gameData = inject('gameData');
        const selectedHero = ref(null);

        function getRole(roleId) {
            return ROLES.find(r => r.id === roleId) || ROLES[0];
        }

        function getQualityColor(quality) {
            return QUALITY_COLORS[quality] || '#fff';
        }

        function getEquipTypeLabel(type) {
            const labels = { weapon: '武器', armor: '防具', accessory: '饰品' };
            return labels[type] || type;
        }

        function unequipFromHero(hero, slot) {
            if (!hero.equipment[slot]) return;
            addToInventory(gameData.value.equipment, { ...hero.equipment[slot], count: 1 });
            sortInventory(gameData.value.equipment);
            hero.equipment[slot] = null;
        }

        function canEquip(equip, hero) {
            return !equip.forRole || equip.forRole === hero.roleId;
        }

        function autoEquipAll() {
            const inv = gameData.value.equipment;
            gameData.value.heroes.forEach(hero => {
                EQUIP_TYPES.forEach(slot => {
                    const candidates = inv.filter(e => e.type === slot && canEquip(e, hero));
                    if (candidates.length === 0) return;
                    candidates.sort((a, b) => b.quality - a.quality || b.bonus - a.bonus);
                    const best = candidates[0];
                    const current = hero.equipment[slot];
                    if (current && current.quality >= best.quality && current.bonus >= best.bonus) return;
                    if (current) {
                        addToInventory(inv, { ...current, count: 1 });
                    }
                    hero.equipment[slot] = { ...best, count: 1 };
                    removeFromInventory(inv, best);
                });
            });
            sortInventory(inv);
        }

        return {
            gameData, selectedHero, getRole, getQualityColor,
            getEquipTypeLabel, getHeroTotalStat, unequipFromHero, autoEquipAll
        };
    }
};
