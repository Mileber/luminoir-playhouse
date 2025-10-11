// NPC类型
export enum NPCType {
  DEFAULT = 1,     // 默认NPC
  QUEST_GIVER = 2, // 任务发布者
  ITEM_GIVER = 3,  // 物品给予者
  MERCHANT = 4,    // 商人
  GUARD = 5,       // 守卫
}

// NPC接口定义
interface NPCBase {
  name: string;
  dialog: string;
  type: NPCType;
}

interface QuestNPC extends NPCBase {
  quests: number[];
}

interface ItemNPC extends NPCBase {
  items: string[];
}

interface MerchantNPC extends NPCBase {
  shopType: number; // ShopType在其他文件中定义
}

interface GuardNPC extends NPCBase {
  requirement: {
    attack: number;
    defense: number;
  };
}

export type NPCs = {
  [NPCType.DEFAULT]: NPCBase;
  [NPCType.QUEST_GIVER]: QuestNPC;
  [NPCType.ITEM_GIVER]: ItemNPC;
  [NPCType.MERCHANT]: MerchantNPC;
  [NPCType.GUARD]: GuardNPC;
};

// 特殊NPC数据
export const npcs: NPCs = {
  [NPCType.DEFAULT]: { 
    name: '普通NPC',
    dialog: '你好，冒险者...',
    type: NPCType.DEFAULT
  },
  [NPCType.QUEST_GIVER]: { 
    name: '老法师',
    dialog: '年轻的勇者，我有一个重要的任务交给你...',
    quests: [1],
    type: NPCType.QUEST_GIVER
  },
  [NPCType.ITEM_GIVER]: { 
    name: '神秘商人',
    dialog: '我这里有一些珍贵的物品，或许对你有帮助...',
    items: ['luckyGold', 'cross'],
    type: NPCType.ITEM_GIVER
  },
  [NPCType.MERCHANT]: { 
    name: '武器大师',
    dialog: '我这里出售最好的武器和防具...',
    shopType: 2, // ShopType.WEAPON
    type: NPCType.MERCHANT
  },
  [NPCType.GUARD]: { 
    name: '塔之守卫',
    dialog: '只有拥有足够实力的人才能继续前进...',
    requirement: { attack: 100, defense: 50 },
    type: NPCType.GUARD
  }
};