// 地图元素类型
export enum TileType {
  WALL = 0,        // 墙
  FLOOR = 1,       // 地板
  MONSTER = 3,     // 怪物
  STAIRS = 4,      // 楼梯
  YELLOW_DOOR = 5, // 黄门
  BLUE_DOOR = 6,   // 蓝门
  RED_DOOR = 7,    // 红门
  SHOP = 8,        // 商店
  NPC = 9,         // NPC
  RED_POTION = 10, // 红药水
  BLUE_POTION = 11, // 蓝药水
  YELLOW_KEY = 12, // 黄钥匙
  BLUE_KEY = 13,   // 蓝钥匙
  RED_KEY = 14,    // 红钥匙
  CROSS = 15,      // 十字架
  FLY = 16,        // 飞行器
  HOLY_WATER = 17, // 圣水
  LUCKY_GOLD = 18, // 幸运金币
  ICE_MAGIC = 19,  // 冰冻魔法
  SWORD = 20,      // 神剑
  SHIELD = 21,     // 神盾
  UP_FLOOR = 22,   // 上楼器
  DOWN_FLOOR = 23, // 下楼器
  PICKAXE = 24,    // 铁镐
  BOMB = 25,       // 炸弹
  EARTHQUAKE = 26, // 地震卷轴
  MONSTER_BOOK = 27, // 怪物手册
  DARK_WALL = 28,  // 暗墙
  QUEST_NPC = 29,  // 任务NPC
  ITEM_NPC = 30,   // 物品NPC
  MERCHANT_NPC = 31, // 商人NPC
  GUARD_NPC = 32,  // 守卫NPC
}