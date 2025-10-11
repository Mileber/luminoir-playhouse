// 商店类型
export enum ShopType {
  NORMAL = 1,      // 普通商店
  WEAPON = 2,      // 武器商店
  MAGIC = 3,       // 魔法商店
  SPECIAL = 4,     // 特殊商店
}

// 商店物品定义
export const shopItems = {
  [ShopType.NORMAL]: [
    { id: 'redPotion', name: '红药水', price: 20, type: 'consumable' },
    { id: 'bluePotion', name: '蓝药水', price: 50, type: 'consumable' },
    { id: 'attackBoost', name: '攻击力+10', price: 100, type: 'enhancement' },
    { id: 'defenseBoost', name: '防御力+10', price: 100, type: 'enhancement' }
  ],
  [ShopType.WEAPON]: [
    { id: 'sword', name: '神剑', price: 500, type: 'weapon' },
    { id: 'shield', name: '神盾', price: 500, type: 'armor' },
    { id: 'cross', name: '十字架', price: 1000, type: 'special' }
  ],
  [ShopType.MAGIC]: [
    { id: 'iceMagic', name: '冰冻魔法', price: 800, type: 'magic' },
    { id: 'fly', name: '飞行器', price: 1200, type: 'special' },
    { id: 'holyWater', name: '圣水', price: 1500, type: 'consumable' }
  ],
  [ShopType.SPECIAL]: [
    { id: 'luckyGold', name: '幸运金币', price: 2000, type: 'special' },
    { id: 'earthquake', name: '地震卷轴', price: 1800, type: 'special' },
    { id: 'monsterBook', name: '怪物手册', price: 300, type: 'special' }
  ]
};

// 商店类型名称
export const shopTypeNames = {
  [ShopType.NORMAL]: '普通商店',
  [ShopType.WEAPON]: '武器商店',
  [ShopType.MAGIC]: '魔法商店',
  [ShopType.SPECIAL]: '特殊商店'
};

// 获取商店类型名称
export const getShopTypeName = (type: ShopType): string => {
  return shopTypeNames[type] || '商店';
};

// 获取商店欢迎信息
export const getShopWelcomeMessage = (type: ShopType): string => {
  const messages = {
    [ShopType.NORMAL]: '欢迎光临！请选择要购买的物品：',
    [ShopType.WEAPON]: '这里有强大的武器和防具：',
    [ShopType.MAGIC]: '神秘的魔法道具正在出售：',
    [ShopType.SPECIAL]: '稀有的特殊物品在这里可以找到：'
  };
  return messages[type] || '欢迎光临！请选择要购买的物品：';
};