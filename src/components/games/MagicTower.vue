<template>
  <div class="magic-tower">
    <div class="game-container">
      <!-- 状态面板 -->
      <div class="status-panel">
        <div class="player-stats">
          <h3>角色状态</h3>
          <div class="stat">
            <span class="label">生命值:</span>
            <span class="value">{{ player.hp }}/{{ player.maxHp }}</span>
          </div>
          <div class="stat">
            <span class="label">攻击力:</span>
            <span class="value">{{ player.attack }}</span>
          </div>
          <div class="stat">
            <span class="label">防御力:</span>
            <span class="value">{{ player.defense }}</span>
          </div>
          <div class="stat">
            <span class="label">金币:</span>
            <span class="value">{{ player.gold }}</span>
          </div>
          <div class="stat">
            <span class="label">经验:</span>
            <span class="value">{{ player.exp }}</span>
          </div>
          <div class="stat">
            <span class="label">等级:</span>
            <span class="value">{{ player.level }}</span>
          </div>
          <div class="stat">
            <span class="label">楼层:</span>
            <span class="value">{{ player.floor + 1 }}</span>
          </div>
        </div>
        
        <div class="inventory">
          <h3>道具</h3>
          <div class="items">
            <div class="item" @click="useItem('redPotion')">
              <span>红药水</span>
              <span>{{ inventory.redPotion }}</span>
            </div>
            <div class="item" @click="useItem('bluePotion')">
              <span>蓝药水</span>
              <span>{{ inventory.bluePotion }}</span>
            </div>
            <div class="item">
              <span>黄钥匙</span>
              <span>{{ inventory.yellowKey }}</span>
            </div>
            <div class="item">
              <span>蓝钥匙</span>
              <span>{{ inventory.blueKey }}</span>
            </div>
            <div class="item">
              <span>红钥匙</span>
              <span>{{ inventory.redKey }}</span>
            </div>
            <div class="item" v-if="inventory.iceMagic > 0">
              <span>冰冻魔法</span>
              <span>{{ inventory.iceMagic }}</span>
            </div>
            <div class="item" v-if="inventory.fly > 0" @click="useItem('fly')">
              <span>飞行器</span>
              <span>{{ inventory.fly }}</span>
            </div>
            <div class="item" v-if="inventory.holyWater > 0" @click="useItem('holyWater')">
              <span>圣水</span>
              <span>{{ inventory.holyWater }}</span>
            </div>
            <div class="item" v-if="inventory.luckyGold > 0">
              <span>幸运金币</span>
              <span>{{ inventory.luckyGold }}</span>
            </div>
            <div class="item" v-if="inventory.earthquake > 0">
              <span>地震卷轴</span>
              <span>{{ inventory.earthquake }}</span>
            </div>
            <div class="item" v-if="inventory.monsterBook > 0">
              <span>怪物手册</span>
              <span>{{ inventory.monsterBook }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 游戏区域 -->
      <div class="game-area">
        <!-- 移动控制 (移动端) -->
        <div v-if="showControls" class="controls">
          <button @click="movePlayer(0, -1)">↑</button>
          <div>
            <button @click="movePlayer(-1, 0)">←</button>
            <button @click="movePlayer(1, 0)">→</button>
          </div>
          <button @click="movePlayer(0, 1)">↓</button>
        </div>
        
        <!-- 地图 -->
        <div class="map-container">
          <div 
            class="map" 
            :style="{ 
              gridTemplateColumns: `repeat(${MAP_WIDTH}, 40px)`,
              gridTemplateRows: `repeat(${MAP_HEIGHT}, 40px)`
            }"
          >
            <div
              v-for="(row, y) in maps[player.floor]" 
              :key="y"
              class="row"
            >
              <div
                v-for="(tile, x) in row" 
                :key="x"
                class="cell"
                :class="{
                  wall: tile === TileType.WALL,
                  floor: tile === TileType.FLOOR,
                  stairUp: tile === 4 && x === 9 && y === 9,
                  stairDown: tile === 4 && x === 1 && y === 1,
                  yellowDoor: tile === TileType.YELLOW_DOOR,
                  blueDoor: tile === TileType.BLUE_DOOR,
                  redDoor: tile === TileType.RED_DOOR,
                  shop: tile === TileType.SHOP,
                  redPotion: tile === TileType.RED_POTION,
                  bluePotion: tile === TileType.BLUE_POTION,
                  yellowKey: tile === TileType.YELLOW_KEY,
                  blueKey: tile === TileType.BLUE_KEY,
                  redKey: tile === TileType.RED_KEY,
                  cross: tile === TileType.CROSS,
                  fly: tile === TileType.FLY,
                  holyWater: tile === TileType.HOLY_WATER,
                  luckyGold: tile === TileType.LUCKY_GOLD,
                  iceMagic: tile === TileType.ICE_MAGIC,
                  sword: tile === TileType.SWORD,
                  shield: tile === TileType.SHIELD,
                  upFloor: tile === TileType.UP_FLOOR,
                  downFloor: tile === TileType.DOWN_FLOOR,
                  pickaxe: tile === TileType.PICKAXE,
                  bomb: tile === TileType.BOMB,
                  earthquake: tile === TileType.EARTHQUAKE,
                  monsterBook: tile === TileType.MONSTER_BOOK,
                  darkWall: tile === TileType.DARK_WALL,
                  monster: tile === TileType.MONSTER,
                  npc: tile === TileType.NPC,
                  player: player.x === x && player.y === y,
                }"
              >
                <div v-if="player.x === x && player.y === y" class="player">-hero-</div>
                <div v-else-if="tile === TileType.MONSTER" class="monster">
                  {{ monsters[tile]?.name || '怪物' }}
                </div>
                <div v-else-if="tile === TileType.SHOP" class="shop-icon">S</div>
                <div v-else-if="tile === TileType.NPC" class="npc-info">
                  NPC
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 消息显示 -->
        <div class="messages">
          <div 
            v-for="(message, index) in messages" 
            :key="index" 
            class="message"
          >
            {{ message }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 对话框 -->
    <div v-if="dialogVisible" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-content">
          <h3>对话</h3>
          <p>{{ dialogText }}</p>
          
          <div v-if="dialogOptions.length > 0" class="dialog-options">
            <button
              v-for="(option, index) in dialogOptions"
              :key="index"
              @click="() => { if (option.action) option.action(); }"
            >
              {{ option.text }}
            </button>
          </div>
          <button v-else @click="closeDialog">确定</button>
        </div>
      </div>
    </div>
    
    <!-- 商店 -->
    <div v-if="shopVisible" class="dialog-overlay" @click="closeShop">
      <div class="dialog" @click.stop>
        <div class="dialog-content">
          <h3>{{ getShopTypeName(currentShopType) }}</h3>
          <p>{{ getShopWelcomeMessage(currentShopType) }}</p>
          
          <div class="shop-items">
            <div 
              v-for="(item, index) in shopItems[currentShopType]" 
              :key="index"
              class="shop-item"
            >
              <span>{{ item.name }} ({{ item.price }}金币)</span>
              <button @click="buyItem(item)">购买</button>
            </div>
          </div>
          
          <div class="shop-types">
            <button 
              v-for="(name, type) in shopTypeNames" 
              :key="type"
              :class="{ active: currentShopType === Number(type) }"
              @click="switchShopType(Number(type))"
            >
              {{ name }}
            </button>
          </div>
          
          <button @click="closeShop">关闭商店</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// 导入配置文件
import { maps as mapsConfig } from './magicTower/config/maps'
import { monsters as monstersConfig } from './magicTower/config/monsters'
import { quests as questsConfig } from './magicTower/config/quests'
import { npcs as npcsConfig, NPCType } from './magicTower/config/npcs'
import { 
  ShopType, 
  shopItems as shopItemsConfig, 
  shopTypeNames as shopTypeNamesConfig, 
  getShopTypeName as getShopTypeNameConfig, 
  getShopWelcomeMessage as getShopWelcomeMessageConfig 
} from './magicTower/config/shops'
import { TileType } from './magicTower/config/tileTypes'
import { MAP_WIDTH, MAP_HEIGHT } from './magicTower/config/constants'
import { itemNames, tileToInventoryMap } from './magicTower/config/items'

// 地图数据（扩展至30层）
const maps = ref(mapsConfig)

// 怪物数据
const monsters = ref(monstersConfig)

// 任务数据
const quests = ref(questsConfig)

// NPC数据
const npcs = ref(npcsConfig)

// 商店物品定义
const shopItems = ref(shopItemsConfig)

// 商店类型名称
const shopTypeNames = ref(shopTypeNamesConfig)

// 获取商店类型名称
const getShopTypeName = (type: ShopType): string => {
  return getShopTypeNameConfig(type);
};

// 获取商店欢迎信息
const getShopWelcomeMessage = (type: ShopType): string => {
  return getShopWelcomeMessageConfig(type);
};

// 当前商店类型
const currentShopType = ref<ShopType>(ShopType.NORMAL)

// 玩家状态
const player = ref({
  x: 0,
  y: 0,
  hp: 1000,
  maxHp: 1000,
  attack: 10,
  defense: 10,
  gold: 0,
  exp: 0,
  level: 1,
  floor: 0
})

// 道具库存
const inventory = ref({
  redPotion: 0,
  bluePotion: 0,
  yellowKey: 0,
  blueKey: 0,
  redKey: 0,
  // 特殊道具
  cross: 0,        // 十字架
  upFloor: 0,      // 上楼器
  downFloor: 0,    // 下楼器
  fly: 0,          // 飞行器
  pickaxe: 0,      // 铁镐
  bomb: 0,         // 炸弹
  holyWater: 0,    // 圣水
  luckyGold: 0,    // 幸运金币
  iceMagic: 0,     // 冰冻魔法
  earthquake: 0,   // 地震卷轴
  monsterBook: 0,  // 怪物手册
  sword: 0,        // 神剑
  shield: 0,       // 神盾
})

// 消息系统
const messages = ref<string[]>([])

// 对话框
const dialogVisible = ref(false)
const dialogText = ref('')
const dialogOptions = ref<{text: string, action: () => void}[]>([])

// 商店
const shopVisible = ref(false)

// 控制按钮显示（移动端）
const showControls = ref(false)

// 添加消息
const addMessage = (msg: string) => {
  messages.value.push(msg)
  // 限制消息数量
  if (messages.value.length > 5) {
    messages.value.shift()
  }
}

// 初始化游戏
const initGame = () => {
  // 设置初始位置
  player.value.x = 5
  player.value.y = 9
  player.value.floor = 0
  
  // 初始化状态
  player.value.hp = 1000
  player.value.maxHp = 1000
  player.value.attack = 10
  player.value.defense = 10
  player.value.gold = 0
  player.value.exp = 0
  player.value.level = 1
  
  // 初始化道具
  inventory.value.redPotion = 0
  inventory.value.bluePotion = 0
  inventory.value.yellowKey = 0
  inventory.value.blueKey = 0
  inventory.value.redKey = 0
  
  // 清空消息
  messages.value = []
  addMessage('欢迎来到魔塔！使用方向键移动。')
  
  // 检测是否移动端
  showControls.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 移动玩家
const movePlayer = (dx: number, dy: number) => {
  const newX = player.value.x + dx
  const newY = player.value.y + dy
  
  // 检查边界
  if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
    return
  }
  
  // 获取目标格子类型
  const currentMap = maps.value[player.value.floor]
  if (!currentMap) return
  
  const targetRow = currentMap[newY]
  if (!targetRow) return
  
  const targetCell = targetRow[newX]
  if (targetCell === undefined) return
  
  // 处理不同类型的格子
  switch (targetCell) {
    case TileType.WALL:
      // 墙无法通过
      addMessage('无法通过墙壁')
      return
      
    case TileType.YELLOW_DOOR:
      // 黄门需要黄钥匙
      if (inventory.value.yellowKey > 0) {
        inventory.value.yellowKey--
        const currentMap = maps.value[player.value.floor]
        if (currentMap) {
          const row = currentMap[newY]
          if (row) {
            row[newX] = TileType.FLOOR
          }
        }
        addMessage('使用黄钥匙打开了门')
      } else {
        addMessage('需要黄钥匙才能打开这扇门')
        return
      }
      break
      
    case TileType.BLUE_DOOR:
      // 蓝门需要蓝钥匙
      if (inventory.value.blueKey > 0) {
        inventory.value.blueKey--
        const currentMap = maps.value[player.value.floor]
        if (currentMap) {
          const row = currentMap[newY]
          if (row) {
            row[newX] = TileType.FLOOR
          }
        }
        addMessage('使用蓝钥匙打开了门')
      } else {
        addMessage('需要蓝钥匙才能打开这扇门')
        return
      }
      break
      
    case TileType.RED_DOOR:
      // 红门需要红钥匙
      if (inventory.value.redKey > 0) {
        inventory.value.redKey--
        const currentMap = maps.value[player.value.floor]
        if (currentMap) {
          const row = currentMap[newY]
          if (row) {
            row[newX] = TileType.FLOOR
          }
        }
        addMessage('使用红钥匙打开了门')
      } else {
        addMessage('需要红钥匙才能打开这扇门')
        return
      }
      break
      
    case 4: // STAIRS (之前是1和2，现在统一为4)
      // 楼梯，根据移动方向判断上下楼
      // 这里简化处理，根据位置判断上下楼
      if (newX === 1 && newY === 1) {
        // 下楼
        if (player.value.floor < maps.value.length - 1) {
          player.value.floor++
          player.value.x = 1 // 上一层楼梯的位置
          player.value.y = 1
          addMessage(`来到${player.value.floor + 1}F`)
        }
      } else if (newX === 9 && newY === 9) {
        // 上楼
        if (player.value.floor > 0) {
          player.value.floor--
          player.value.x = 9 // 下一层楼梯的位置
          player.value.y = 9
          addMessage(`来到${player.value.floor + 1}F`)
        }
      }
      return
      
    case TileType.NPC: // NPC (之前是29-32，现在统一为9)
      // NPC交互
      interactWithNPC(targetCell)
      return
      
    case TileType.RED_POTION:
      // 红药水
      inventory.value.redPotion++
      const currentMap1 = maps.value[player.value.floor]
      if (currentMap1) {
        const row = currentMap1[newY]
        if (row) {
          row[newX] = TileType.FLOOR
        }
      }
      addMessage('获得了红药水')
      return
      
    case TileType.BLUE_POTION:
      // 蓝药水
      inventory.value.bluePotion++
      const currentMap2 = maps.value[player.value.floor]
      if (currentMap2) {
        const row = currentMap2[newY]
        if (row) {
          row[newX] = TileType.FLOOR
        }
      }
      addMessage('获得了蓝药水')
      return
      
    case TileType.YELLOW_KEY:
      // 黄钥匙
      inventory.value.yellowKey++
      const currentMap3 = maps.value[player.value.floor]
      if (currentMap3) {
        const row = currentMap3[newY]
        if (row) {
          row[newX] = TileType.FLOOR
        }
      }
      addMessage('获得了黄钥匙')
      return
      
    case TileType.BLUE_KEY:
      // 蓝钥匙
      inventory.value.blueKey++
      const currentMap4 = maps.value[player.value.floor]
      if (currentMap4) {
        const row = currentMap4[newY]
        if (row) {
          row[newX] = TileType.FLOOR
        }
      }
      addMessage('获得了蓝钥匙')
      return
      
    case TileType.RED_KEY:
      // 红钥匙
      inventory.value.redKey++
      const currentMap5 = maps.value[player.value.floor]
      if (currentMap5) {
        const row = currentMap5[newY]
        if (row) {
          row[newX] = TileType.FLOOR
        }
      }
      addMessage('获得了红钥匙')
      return
      
    // 处理特殊道具拾取
    case TileType.CROSS:
    case TileType.FLY:
    case TileType.HOLY_WATER:
    case TileType.LUCKY_GOLD:
    case TileType.ICE_MAGIC:
    case TileType.SWORD:
    case TileType.SHIELD:
    case TileType.UP_FLOOR:
    case TileType.DOWN_FLOOR:
    case TileType.PICKAXE:
    case TileType.BOMB:
    case TileType.EARTHQUAKE:
    case TileType.MONSTER_BOOK: {
      // 获取对应的库存属性名
      const inventoryKey = tileToInventoryMap[targetCell];
      if (inventoryKey) {
        // 安全地更新库存
        inventory.value[inventoryKey as keyof typeof inventory.value] = 
          (inventory.value[inventoryKey as keyof typeof inventory.value] || 0) + 1;
        
        // 更新地图
        const currentMap = maps.value[player.value.floor];
        if (currentMap) {
          const row = currentMap[newY];
          if (row) {
            row[newX] = TileType.FLOOR;
          }
        }
        
        // 获取道具名称
        const itemName = itemNames[inventoryKey];
        addMessage(`获得了${itemName}`);
      }
      return;
    }
      
    case TileType.DARK_WALL:
      // 暗墙，需要使用铁镐或炸弹才能通过
      if (inventory.value.pickaxe > 0 || inventory.value.bomb > 0) {
        addMessage('使用工具破坏了暗墙')
        if (inventory.value.pickaxe > 0) {
          inventory.value.pickaxe--
        } else {
          inventory.value.bomb--
        }
        const currentMap = maps.value[player.value.floor]
        if (currentMap) {
          const row = currentMap[newY]
          if (row) {
            row[newX] = TileType.FLOOR
          }
        }
      } else {
        addMessage('需要工具才能破坏这面暗墙')
        return
      }
      break
      
    case TileType.MONSTER:
      // 怪物战斗
      fightMonster(targetCell)
      return
  }
  
  // 更新玩家位置
  player.value.x = newX
  player.value.y = newY
  
  // 检查是否胜利（到达最后一层并击败最终BOSS）
  checkVictory()
}

// 怪物战斗
const fightMonster = (monsterType: number) => {
  const currentMap = maps.value[player.value.floor]
  const y = player.value.y
  const x = player.value.x
  const monster = monsters.value[monsterType as keyof typeof monsters.value]
  
  // 检查玩家是否能够击败怪物
  const playerAttack = player.value.attack
  const playerDefense = player.value.defense
  const crossBonus = inventory.value.cross > 0 ? 2 : 1

  // 如果玩家攻击力小于等于怪物防御力，无法造成伤害
  if (playerAttack * crossBonus <= monster.defense) {
    addMessage(`无法对${monster.name}造成伤害！`)
    return
  }

  // 计算战斗结果
  const playerHits = Math.ceil(monster.hp / ((playerAttack * crossBonus) - monster.defense))
  
  // 计算怪物能对玩家造成的伤害
  let monsterHits = playerHits
  if (monster.attack > playerDefense) {
    monsterHits = Math.ceil(player.value.hp / (monster.attack - playerDefense))
  }

  // 如果怪物能先杀死玩家
  const totalDamage = monsterHits * Math.max(0, monster.attack - playerDefense)
  if (totalDamage >= player.value.hp) {
    addMessage(`你无法击败${monster.name}，因为你会在战斗中死亡！`)
    return
  }

  // 玩家获胜
  let goldGain = monster.gold
  if (inventory.value.luckyGold > 0) {
    goldGain *= 2  // 幸运金币使金币收益翻倍
  }
  
  player.value.hp -= totalDamage
  player.value.gold += goldGain
  player.value.exp += monster.exp
  addMessage(`击败了${monster.name}，损失${totalDamage}点生命值，获得${goldGain}金币和${monster.exp}经验`)
  
  // 清除怪物
  if (currentMap) {
    const row = currentMap[y]
    if (row) {
      row[x] = TileType.FLOOR
    }
  }
  
  checkLevelUp()
}

// 检查升级
const checkLevelUp = () => {
  // 简化的升级系统
  if (player.value.exp >= player.value.level * 100) {
    player.value.level++
    player.value.maxHp += 200
    player.value.hp = player.value.maxHp
    player.value.attack += 5
    player.value.defense += 3
    addMessage(`升级了！现在是${player.value.level}级`)
  }
}

// 检查胜利条件
const checkVictory = () => {
  // 胜利条件：到达最后一层并击败最终BOSS
  if (player.value.floor === maps.value.length - 1) {
    // 检查当前层是否还有怪物（BOSS是否被击败）
    const currentMap = maps.value[player.value.floor];
    let hasMonster = false;
    
    if (currentMap) {
      for (let y = 0; y < currentMap.length; y++) {
        const row = currentMap[y];
        if (row) {
          for (let x = 0; x < row.length; x++) {
            if (row[x] === TileType.MONSTER) {
              hasMonster = true;
              break;
            }
          }
        }
        if (hasMonster) break;
      }
    }
    
    // 如果没有怪物，说明BOSS已被击败，游戏胜利
    if (!hasMonster) {
      addMessage('恭喜你！击败了最终BOSS，完成了魔塔挑战！');
      addMessage('你成功完成了整个魔塔的冒险！');
      // 这里可以添加更多胜利后的逻辑，比如显示胜利画面等
    }
  }
}

// 关闭商店
const closeShop = () => {
  shopVisible.value = false
}

// 切换商店类型
const switchShopType = (type: ShopType) => {
  currentShopType.value = type
}

// 购买物品
const buyItem = (item: { id: string; name: string; price: number }) => {
  if (player.value.gold >= item.price) {
    player.value.gold -= item.price
    
    // 根据物品类型增加对应物品数量
    switch (item.id) {
      case 'redPotion':
        inventory.value.redPotion++
        break
      case 'bluePotion':
        inventory.value.bluePotion++
        break
      case 'yellowKey':
        inventory.value.yellowKey++
        break
      case 'blueKey':
        inventory.value.blueKey++
        break
      case 'redKey':
        inventory.value.redKey++
        break
      case 'sword':
        player.value.attack += 10
        break
      case 'shield':
        player.value.defense += 10
        break
      case 'cross':
        inventory.value.cross++
        break
      case 'iceMagic':
        inventory.value.iceMagic++
        break
      case 'fly':
        inventory.value.fly++
        break
      case 'holyWater':
        inventory.value.holyWater++
        break
      case 'luckyGold':
        inventory.value.luckyGold++
        break
      case 'earthquake':
        inventory.value.earthquake++
        break
      case 'monsterBook':
        inventory.value.monsterBook++
        break
    }
    
    addMessage(`购买了${item.name}`)
  } else {
    addMessage('金币不足！')
  }
}

type NPC = {
  type: NPCType;
  dialog: string;
  quests?: number[];
  items?: string[];
  shopType?: ShopType;
  requirement?: {
    attack: number;
    defense: number;
  };
};

// 处理与NPC的交互
const interactWithNPC = (npcType: number) => {
  const npc = npcs.value[npcType as keyof typeof npcs.value]
  if (npc) {
    switch (npc.type) {
      case NPCType.QUEST_GIVER:
        const questNPC = npc as NPC;
        if (questNPC.quests && questNPC.quests.length > 0) {
          const questId = questNPC.quests[0];
          if (questId !== undefined) {
            dialogOptions.value = [
              { text: '接受任务', action: () => acceptQuest(questId) },
              { text: '询问详情', action: () => showQuestDetails(questId) },
              { text: '离开', action: closeDialog }
            ];
          }
        }
        dialogText.value = npc.dialog
        dialogVisible.value = true
        break
        
      case NPCType.ITEM_GIVER:
        const itemNPC = npc as NPC;
        if (itemNPC.items && itemNPC.items.length > 0) {
          const item = itemNPC.items[0]
          switch (item) {
            case 'luckyGold':
              player.value.gold += 500
              addMessage('获得了幸运金币，金币+500')
              break
            case 'cross':
              inventory.value.cross += 1
              addMessage('获得了十字架')
              break
          }
        }
        dialogText.value = npc.dialog
        dialogVisible.value = true
        break
        
      case NPCType.MERCHANT:
        const merchantNPC = npc as NPC;
        if (merchantNPC.shopType !== undefined) {
          currentShopType.value = merchantNPC.shopType
          shopVisible.value = true
        }
        break
        
      case NPCType.GUARD:
        const guardNPC = npc as NPC;
        if (guardNPC.requirement && 
            player.value.attack >= guardNPC.requirement.attack && 
            player.value.defense >= guardNPC.requirement.defense) {
          addMessage('守卫让你通过了')
          // 这里应该执行通过逻辑，比如移除守卫或打开通道
        } else {
          addMessage('守卫拦住了你，你的实力还不够')
        }
        break
        
      default:
        dialogText.value = npc.dialog
        dialogVisible.value = true
        break
    }
  }
}

// 接受任务
const acceptQuest = (questId: number) => {
  const questKey = questId.toString()
  if (questKey in quests.value) {
    const quest = quests.value[questKey as keyof typeof quests.value];
    addMessage(`接受了任务：${quest.name}`)
  }
  closeDialog()
}

// 显示任务详情
const showQuestDetails = (questId: number) => {
  const questKey = questId.toString()
  if (questKey in quests.value) {
    const quest = quests.value[questKey as keyof typeof quests.value];
    dialogText.value = quest.description
  }
}

// 使用物品
const useItem = (itemType: string) => {
  switch (itemType) {
    case 'redPotion':
      if (inventory.value.redPotion > 0) {
        inventory.value.redPotion--
        player.value.hp = Math.min(player.value.hp + 200, player.value.maxHp)
        addMessage('使用了红药水，恢复200点生命值')
      }
      break
    case 'bluePotion':
      if (inventory.value.bluePotion > 0) {
        inventory.value.bluePotion--
        player.value.hp = Math.min(player.value.hp + 500, player.value.maxHp)
        addMessage('使用了蓝药水，恢复500点生命值')
      }
      break
    case 'fly':
      if (inventory.value.fly > 0) {
        inventory.value.fly--
        player.value.x = MAP_WIDTH - 1 - player.value.x
        player.value.y = MAP_HEIGHT - 1 - player.value.y
        addMessage('使用了飞行器，传送到对称位置')
      }
      break
    case 'holyWater':
      if (inventory.value.holyWater > 0) {
        inventory.value.holyWater--
        player.value.maxHp *= 2
        player.value.hp = player.value.maxHp
        addMessage('使用了圣水，生命值上限翻倍')
      }
      break
    case 'luckyGold':
      if (inventory.value.luckyGold > 0) {
        inventory.value.luckyGold--
        player.value.gold += 1000
        addMessage('使用了幸运金币，获得1000金币')
      }
      break
  }
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
  dialogText.value = ''
  dialogOptions.value = []
}

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowUp':
      movePlayer(0, -1)
      break
    case 'ArrowDown':
      movePlayer(0, 1)
      break
    case 'ArrowLeft':
      movePlayer(-1, 0)
      break
    case 'ArrowRight':
      movePlayer(1, 0)
      break
  }
}

// 初始化游戏
onMounted(() => {
  initGame()
  window.addEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.magic-tower {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 100%;
  box-sizing: border-box;
}

.game-container {
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 1000px;
}

.status-panel {
  width: 200px;
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.player-stats .stat {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.inventory {
  margin-top: 20px;
}

.inventory h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.items .item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
  gap: 5px;
}

.controls button {
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.controls button:hover {
  background-color: #e0e0e0;
}

.map-container {
  overflow: auto;
  border: 2px solid #333;
  border-radius: 4px;
  background-color: #eee;
}

.map {
  display: grid;
  gap: 1px;
  background-color: #999;
}

.cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  text-align: center;
}

.wall {
  background-color: #666;
}

.floor {
  background-color: #ddd;
}

.stairs {
  background-color: #ff9900;
  font-weight: bold;
}

.yellow-door {
  background-color: #ffcc00;
}

.blue-door {
  background-color: #0066cc;
}

.red-door {
  background-color: #cc0000;
}

.shop {
  background-color: #66cc66;
}

.npc {
  background-color: #9933cc;
}

.red-potion {
  background-color: #ff3333;
}

.blue-potion {
  background-color: #3333ff;
}

.yellow-key {
  background-color: #ffcc00;
}

.blue-key {
  background-color: #0066cc;
}

.red-key {
  background-color: #cc0000;
}

.cross {
  background-color: #ffff00;
  color: #000;
  font-weight: bold;
}

.fly {
  background-color: #00ffff;
  color: #000;
  font-weight: bold;
}

.holy-water {
  background-color: #0000ff;
  color: #fff;
  font-weight: bold;
}

.lucky-gold {
  background-color: #ffd700;
  color: #000;
  font-weight: bold;
}

.ice-magic {
  background-color: #87ceeb;
  color: #000;
  font-weight: bold;
}

.sword {
  background-color: #c0c0c0;
  color: #000;
  font-weight: bold;
}

.shield {
  background-color: #808080;
  color: #fff;
  font-weight: bold;
}

.up-floor {
  background-color: #98fb98;
  color: #000;
  font-weight: bold;
}

.down-floor {
  background-color: #00fa9a;
  color: #000;
  font-weight: bold;
}

.pickaxe {
  background-color: #a0522d;
  color: #fff;
  font-weight: bold;
}

.bomb {
  background-color: #ff0000;
  color: #fff;
  font-weight: bold;
}

.earthquake {
  background-color: #8b4513;
  color: #fff;
  font-weight: bold;
}

.monster-book {
  background-color: #dda0dd;
  color: #000;
  font-weight: bold;
}

.dark-wall {
  background-color: #2f4f4f;
  color: #fff;
  font-weight: bold;
}

.quest-npc {
  background-color: #9370db;
  color: #fff;
  font-weight: bold;
}

.item-npc {
  background-color: #da70d6;
  color: #fff;
  font-weight: bold;
}

.merchant-npc {
  background-color: #4169e1;
  color: #fff;
  font-weight: bold;
}

.guard-npc {
  background-color: #8b0000;
  color: #fff;
  font-weight: bold;
}

.player {
  background-color: #4caf50;
  color: white;
  font-weight: bold;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.messages {
  margin-top: 15px;
  width: 100%;
  max-width: 500px;
}

.message {
  padding: 5px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 5px;
  font-size: 14px;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
}

.dialog-content h3 {
  margin-top: 0;
  color: #333;
}

.dialog-options {
  margin: 15px 0;
}

.dialog-options button,
.dialog-content button {
  display: block;
  width: 100%;
  margin: 5px 0;
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-content button:hover {
  background-color: #45a049;
}

.shop-items {
  margin: 15px 0;
}

.shop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.shop-item:last-child {
  border-bottom: none;
}

.shop-types {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 15px 0;
}

.shop-types button {
  flex: 1;
  min-width: calc(50% - 5px);
  background-color: #2196f3;
  padding: 8px;
}

.shop-types button.active {
  background-color: #0d47a1;
}

.shop-types button:hover {
  background-color: #1976d2;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .game-container {
    flex-direction: column;
  }
  
  .status-panel {
    width: 100%;
  }
  
  .cell {
    width: 30px;
    height: 30px;
    font-size: 10px;
  }
}
</style>