<template>
  <div class="sheep-game">
    <div class="game-header">
      <h1>羊了个羊</h1>
      <div class="game-info">
        <div class="score">得分: {{ score }}</div>
        <button @click="resetGame" class="reset-btn">重新开始</button>
      </div>
    </div>

    <div class="game-container">
      <!-- 游戏主区域 -->
      <div class="game-board">
        <div 
          v-for="(layer, zIndex) in board" 
          :key="zIndex" 
          class="board-layer"
          :style="{ zIndex: zIndex }"
        >
          <div
            v-for="(row, y) in layer"
            :key="y"
            class="board-row"
          >
            <div
              v-for="(cell, x) in row"
              :key="x"
              class="board-cell"
              :class="{ 
                'has-block': cell !== null, 
                'top-block': isTopBlock(x, y, zIndex),
                'selected': selectedBlocks.some(b => b.x === x && b.y === y && b.z === zIndex)
              }"
              @click="selectBlock(x, y, zIndex)"
            >
              <div v-if="cell !== null" class="block" :class="'block-' + cell">
                {{ getEmojiForType(cell) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部槽位区域 -->
      <div class="slot-area">
        <h3>槽位</h3>
        <div class="slots">
          <div 
            v-for="(slot, index) in slots" 
            :key="index" 
            class="slot"
            :class="{ 'filled': slot !== null }"
          >
            <div v-if="slot !== null" class="block" :class="'block-' + slot">
              {{ getEmojiForType(slot) }}
            </div>
          </div>
        </div>
        <div class="slot-info">
          <p>剩余空间: {{ 7 - filledSlots }} / 7</p>
        </div>
      </div>
    </div>

    <!-- 游戏状态提示 -->
    <div v-if="gameOver" class="game-over-overlay">
      <div class="game-over-message">
        <h2>{{ gameWin ? '恭喜通关!' : '游戏结束' }}</h2>
        <p>{{ gameWin ? '你成功消除了所有方块！' : '槽位已满，游戏结束。' }}</p>
        <button @click="resetGame">再玩一次</button>
      </div>
    </div>

    <!-- 移动端操作说明 -->
    <div class="instructions" v-if="isMobile">
      <p>点击最上层的方块将其移至底部槽位，三个相同图案可消除</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 定义方块类型
const BLOCK_TYPES = [
  '🍓', '🍊', '🍇', '🍉', '🍌', '🍎', '🍑',  // 水果类
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻',  // 动物类
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓'   // 交通工具类
]

type BoardType = Array<Array<Array<number | null>>>
type SlotsType = Array<number | null>

// 游戏状态
const board = ref<BoardType>([])
const slots = ref<SlotsType>(Array(7).fill(null))
const selectedBlocks = ref<Array<{x: number, y: number, z: number}>>([])
const score = ref(0)
const gameOver = ref(false)
const gameWin = ref(false)

// 检测是否为移动端
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

// 计算已填充的槽位数量
const filledSlots = computed(() => {
  return slots.value.filter(slot => slot !== null).length
})

// 初始化游戏
const initGame = () => {
  // 创建一个3层的简单关卡
  const newBoard: BoardType = []
  
  // 第一层 - 底层 (3x3)
  const layer1: Array<Array<number | null>> = []
  for (let y = 0; y < 3; y++) {
    const row: Array<number | null> = []
    for (let x = 0; x < 3; x++) {
      row.push(Math.floor(Math.random() * BLOCK_TYPES.length))
    }
    layer1.push(row)
  }
  newBoard.push(layer1)
  
  // 第二层 (3x3)，部分覆盖第一层
  const layer2: Array<Array<number | null>> = []
  for (let y = 0; y < 3; y++) {
    const row: Array<number | null> = []
    for (let x = 0; x < 3; x++) {
      // 部分方块覆盖下层
      if (Math.random() > 0.3) {
        row.push(Math.floor(Math.random() * BLOCK_TYPES.length))
      } else {
        row.push(null)
      }
    }
    layer2.push(row)
  }
  newBoard.push(layer2)
  
  // 第三层 - 顶层 (2x2)，放在中间
  const layer3: Array<Array<number | null>> = []
  for (let y = 0; y < 5; y++) {
    const row: Array<number | null> = []
    for (let x = 0; x < 5; x++) {
      // 在中间放置2x2的方块
      if (y >= 1 && y <= 2 && x >= 1 && x <= 2) {
        row.push(Math.floor(Math.random() * BLOCK_TYPES.length))
      } else {
        row.push(null)
      }
    }
    layer3.push(row)
  }
  newBoard.push(layer3)
  
  board.value = newBoard
  slots.value = Array(7).fill(null)
  selectedBlocks.value = []
  score.value = 0
  gameOver.value = false
  gameWin.value = false
}

// 判断是否为最上层方块
const isTopBlock = (x: number, y: number, z: number): boolean => {
  // 如果已经是最高层，则总是最上层方块
  if (z === board.value.length - 1) {
    return board.value[z]?.[y]?.[x] !== null
  }
  
  // 检查上方层是否有方块覆盖
  for (let i = z + 1; i < board.value.length; i++) {
    // 使用可选链操作符安全访问
    if (board.value[i]?.[y]?.[x] !== undefined && 
        board.value[i]?.[y]?.[x] !== null) {
      return false
    }
  }
  
  return board.value[z]?.[y]?.[x] !== null
}

// 选择方块
const selectBlock = (x: number, y: number, z: number) => {
  // 如果游戏已结束，不能操作
  if (gameOver.value) return
  
  // 只能选择最上层的方块
  if (!isTopBlock(x, y, z)) return
  
  // 检查索引是否有效
  if (!board.value[z] || !board.value[z][y]) return
  
  const blockType = board.value[z][y][x]
  if (blockType === null) return
  
  // 检查槽位是否已满
  if (filledSlots.value >= 7) {
    // 槽位满了，检查是否能消除
    checkElimination()
    if (filledSlots.value >= 7) {
      // 仍然满了，游戏结束
      gameOver.value = true
      gameWin.value = false
      return
    }
  }
  
  // 将方块添加到槽位
  const emptySlotIndex = slots.value.findIndex(slot => slot === null)
  if (emptySlotIndex !== -1 && blockType !== null && blockType !== undefined) {
    slots.value[emptySlotIndex] = blockType
    
    // 标记为已选择（视觉效果）
    selectedBlocks.value.push({x, y, z})
    
    // 从游戏板上移除方块
    if (board.value[z] && board.value[z][y]) {
      board.value[z][y][x] = null
    }
    
    // 检查是否可以消除
    checkElimination()
    
    // 检查是否获胜
    checkWinCondition()
  }
}

// 检查是否可以消除
const checkElimination = () => {
  // 统计每个类型的方块数量
  const countMap: { [key: number]: number } = {}
  
  slots.value.forEach(slot => {
    if (slot !== null) {
      if (countMap[slot]) {
        countMap[slot]++
      } else {
        countMap[slot] = 1
      }
    }
  })
  
  // 查找数量大于等于3的类型
  for (const [type, count] of Object.entries(countMap)) {
    const typeNum = parseInt(type)
    if (count >= 3) {
      // 消除这些方块
      let removed = 0
      for (let i = 0; i < slots.value.length && removed < 3; i++) {
        if (slots.value[i] === typeNum) {
          slots.value[i] = null
          removed++
        }
      }
      
      // 增加分数
      score.value += 300
    }
  }
}

// 检查胜利条件
const checkWinCondition = () => {
  // 检查游戏板是否为空
  const isEmpty = board.value.every(layer => 
    layer.every(row => 
      row.every(cell => cell === null)
    )
  )
  
  if (isEmpty) {
    gameOver.value = true
    gameWin.value = true
  }
}

// 获取方块类型的emoji
const getEmojiForType = (type: number): string => {
  return BLOCK_TYPES[type] || '🧩'
}

// 重置游戏
const resetGame = () => {
  initGame()
}

// 组件挂载时初始化游戏
onMounted(() => {
  initGame()
})
</script>

<style scoped>
.sheep-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 100%;
  box-sizing: border-box;
}

.game-header {
  width: 100%;
  max-width: 600px;
  text-align: center;
  margin-bottom: 20px;
}

.game-header h1 {
  margin: 0 0 10px 0;
  color: #333;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reset-btn {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.reset-btn:hover {
  background-color: #359c6d;
}

.game-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 600px;
}

.game-board {
  position: relative;
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.board-layer {
  position: absolute;
  display: flex;
  flex-direction: column;
}

.board-row {
  display: flex;
}

.board-cell {
  width: 50px;
  height: 50px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: #fafafa;
}

.board-cell.has-block {
  background-color: #e6f7ff;
}

.board-cell.top-block {
  cursor: pointer;
  background-color: #d1e8ff;
}

.board-cell.top-block:hover {
  background-color: #a3d4ff;
  transform: scale(1.05);
}

.board-cell.selected {
  background-color: #ffcccc;
}

.block {
  font-size: 24px;
  user-select: none;
}

.slot-area {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.slot-area h3 {
  margin-top: 0;
}

.slots {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 10px 0;
}

.slot {
  width: 50px;
  height: 50px;
  border: 2px dashed #ccc;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.slot.filled {
  border-style: solid;
  background-color: #e6f7ff;
}

.slot-info p {
  margin: 10px 0 0 0;
  font-size: 14px;
  color: #666;
}

.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.game-over-message {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
  max-width: 90%;
}

.game-over-message h2 {
  margin-top: 0;
}

.game-over-message button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 15px;
}

.instructions {
  margin-top: 20px;
  padding: 10px;
  background-color: #e8f4fd;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
  color: #333;
}

@media (max-width: 600px) {
  .board-cell {
    width: 40px;
    height: 40px;
  }
  
  .block {
    font-size: 20px;
  }
  
  .slot {
    width: 40px;
    height: 40px;
  }
}
</style>