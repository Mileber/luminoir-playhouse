// 道具名称映射
export const itemNames: Record<string, string> = {
  'redPotion': '红药水',
  'bluePotion': '蓝药水',
  'yellowKey': '黄钥匙',
  'blueKey': '蓝钥匙',
  'redKey': '红钥匙',
  'cross': '十字架',
  'upFloor': '上楼器',
  'downFloor': '下楼器',
  'fly': '飞行器',
  'pickaxe': '铁镐',
  'bomb': '炸弹',
  'holyWater': '圣水',
  'luckyGold': '幸运金币',
  'iceMagic': '冰冻魔法',
  'earthquake': '地震卷轴',
  'monsterBook': '怪物手册',
  'sword': '神剑',
  'shield': '神盾'
};

// TileType 到库存属性的映射
import { TileType } from './tileTypes';

export const tileToInventoryMap: Record<number, keyof typeof itemNames> = {
  [TileType.CROSS]: 'cross',
  [TileType.FLY]: 'fly',
  [TileType.HOLY_WATER]: 'holyWater',
  [TileType.LUCKY_GOLD]: 'luckyGold',
  [TileType.ICE_MAGIC]: 'iceMagic',
  [TileType.SWORD]: 'sword',
  [TileType.SHIELD]: 'shield',
  [TileType.UP_FLOOR]: 'upFloor',
  [TileType.DOWN_FLOOR]: 'downFloor',
  [TileType.PICKAXE]: 'pickaxe',
  [TileType.BOMB]: 'bomb',
  [TileType.EARTHQUAKE]: 'earthquake',
  [TileType.MONSTER_BOOK]: 'monsterBook'
};

// 库存键类型
export type InventoryKey = keyof typeof itemNames;