const InventoryPage = {
    template: `
        <div>
            <div class="inventory">
                <div v-for="equip in gameData.equipment" :key="equip.id"
                     class="equip-card" :class="'quality-border-' + equip.quality">
                    <div class="equip-info">
                        <div class="equip-name" :style="{ color: getQualityColor(equip.quality) }">
                            {{ equip.name }} <span v-if="equip.count > 1" class="equip-count">×{{ equip.count }}</span>
                        </div>
                        <div class="equip-type">{{ getRoleLabel(equip.forRole) }} {{ getEquipTypeLabel(equip.type) }} Lv.{{ equip.level }}</div>
                        <div class="equip-bonus">+{{ equip.bonus }} {{ getEquipStatLabel(equip.type) }}</div>
                    </div>
                    <div class="equip-actions">
                        <button @click="startEquip(equip)" class="btn-sm btn-equip">装备</button>
                        <button @click="enhanceEquip(equip)" class="btn-sm"
                                :disabled="gameData.gold < enhanceCost(equip)">
                            强化 ({{ enhanceCost(equip) }}💰)
                        </button>
                        <button @click="sellEquip(equip)" class="btn-sm btn-sell">
                            出售 ({{ sellPrice(equip) }}💰)
                        </button>
                    </div>
                </div>
                <div v-if="!gameData.equipment.length" class="empty-state">背包为空</div>
            </div>
            <div v-if="equipTarget" class="modal" @click.self="equipTarget = null">
                <div class="modal-content">
                    <h3>选择角色装备 {{ equipTarget.name }}</h3>
                    <div v-for="hero in gameData.heroes" :key="hero.roleId"
                         class="stage-option" :class="{ disabled: !canEquip(equipTarget, hero) }"
                         @click="canEquip(equipTarget, hero) && equipToHero(hero)">
                        <span>{{ getRole(hero.roleId).icon }} {{ getRole(hero.roleId).name }} Lv.{{ hero.level }}</span>
                        <span v-if="!canEquip(equipTarget, hero)" class="equipped-info">(职业不符)</span>
                        <span v-else-if="hero.equipment[equipTarget.type]" class="equipped-info">
                            (替换: {{ hero.equipment[equipTarget.type].name }})
                        </span>
                    </div>
                    <button @click="equipTarget = null" class="btn">取消</button>
                </div>
            </div>
        </div>
    `,
    setup() {
        const { ref, inject } = Vue;
        const gameData = inject('gameData');
        const equipTarget = ref(null);

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

        function getEquipStatLabel(type) {
            const labels = { weapon: '攻击', armor: '防御', accessory: '暴击' };
            return labels[type] || '';
        }

        function getRoleLabel(roleId) {
            const role = ROLES.find(r => r.id === roleId);
            return role ? role.name : '';
        }

        function enhanceEquip(equip) {
            const cost = enhanceCost(equip);
            if (gameData.value.gold >= cost) {
                gameData.value.gold -= cost;
                const match = gameData.value.equipment.find(e =>
                    e.name === equip.name && e.quality === equip.quality && e.forRole === equip.forRole
                );
                if (match) {
                    match.level++;
                    match.bonus = match.quality * 5 * match.level;
                }
            }
        }

        function sellEquip(equip) {
            gameData.value.gold += sellPrice(equip);
            removeFromInventory(gameData.value.equipment, equip);
        }

        function startEquip(equip) {
            equipTarget.value = equip;
        }

        function canEquip(equip, hero) {
            return !equip.forRole || equip.forRole === hero.roleId;
        }

        function equipToHero(hero) {
            if (!equipTarget.value) return;
            const equip = equipTarget.value;
            if (equip.forRole && equip.forRole !== hero.roleId) {
                alert(`这件装备是${getRole(equip.forRole).name}专用的！`);
                return;
            }
            const slot = equip.type;
            if (hero.equipment[slot]) {
                addToInventory(gameData.value.equipment, hero.equipment[slot]);
                sortInventory(gameData.value.equipment);
            }
            hero.equipment[slot] = { ...equip, count: 1 };
            removeFromInventory(gameData.value.equipment, equip);
            equipTarget.value = null;
        }

        return {
            gameData, equipTarget, getRole, getQualityColor,
            getEquipTypeLabel, getEquipStatLabel, getRoleLabel,
            enhanceCost, sellPrice, enhanceEquip, sellEquip,
            startEquip, canEquip, equipToHero
        };
    }
};
