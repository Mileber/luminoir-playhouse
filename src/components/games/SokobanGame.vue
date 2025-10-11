<template>
  <div class="sokoban-game">
    <h1>推箱子</h1>
    <div class="game-info">
      <div>关卡: {{ currentLevel + 1 }}/{{ levels.length }}</div>
      <div>步数: {{ steps }}</div>
    </div>
    
    <div class="game-controls">
      <button @click="resetLevel">重置</button>
      <button @click="prevLevel" :disabled="currentLevel === 0">上一关</button>
      <button @click="nextLevel" :disabled="currentLevel === levels.length - 1">下一关</button>
    </div>
    
    <div class="game-board" ref="gameBoard">
      <div 
        v-for="(row, rowIndex) in displayBoard" 
        :key="rowIndex" 
        class="board-row"
      >
        <div 
          v-for="(cell, cellIndex) in row" 
          :key="cellIndex"
          class="cell"
          :class="getCellClass(cell)"
        >
          <div v-if="cell === 4 || cell === 6" class="player"></div>
          <div v-else-if="cell === 2 || cell === 5" class="box"></div>
          <div v-else-if="cell === 3" class="target"></div>
          <div v-else-if="cell === 1" class="wall"></div>
        </div>
      </div>
    </div>
    
    <div class="mobile-controls" v-if="isMobile">
      <div class="control-row">
        <button @click="movePlayer(-1, 0)">↑</button>
      </div>
      <div class="control-row">
        <button @click="movePlayer(0, -1)">←</button>
        <button @click="movePlayer(0, 1)">→</button>
      </div>
      <div class="control-row">
        <button @click="movePlayer(1, 0)">↓</button>
      </div>
    </div>
    
    <div v-if="isWin" class="win-overlay">
      <div class="win-message">
        <h2>恭喜通关!</h2>
        <button @click="nextLevel" v-if="currentLevel < levels.length - 1">下一关</button>
        <button @click="resetLevel" v-else>重新开始</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 定义单元格类型
const CELL_TYPES = {
  EMPTY: 0,     // 空地
  WALL: 1,      // 墙
  BOX: 2,       // 箱子
  TARGET: 3,    // 目标位置
  PLAYER: 4,    // 玩家
  BOX_ON_TARGET: 5,  // 箱子在目标位置
  PLAYER_ON_TARGET: 6 // 玩家在目标位置
}

// 关卡数据
const levels = [
  // 简单关卡
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 2, 2, 2, 0, 1],
    [1, 0, 2, 3, 3, 2, 0, 1],
    [1, 0, 2, 3, 3, 2, 0, 1],
    [1, 0, 2, 2, 2, 2, 0, 1],
    [1, 0, 0, 0, 4, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // 中等关卡
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 2, 0, 1, 0, 2, 0, 1],
    [1, 0, 2, 0, 3, 0, 2, 0, 1],
    [1, 0, 0, 2, 3, 2, 0, 0, 1],
    [1, 1, 1, 0, 3, 0, 1, 1, 1],
    [1, 0, 0, 0, 2, 0, 0, 4, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]
]

const currentLevel = ref(0)
const board = ref<number[][]>([])
const playerPos = ref({ x: 0, y: 0 })
const steps = ref(0)
const isWin = ref(false)
const isMobile = ref(false)

// 初始化关卡
const initLevel = () => {
  const levelData = levels[currentLevel.value]
  board.value = JSON.parse(JSON.stringify(levelData))
  steps.value = 0
  isWin.value = false
  
  // 找到玩家初始位置
  for (let row = 0; row < board.value.length; row++) {
    for (let col = 0; col < (board.value[row]?.length || 0); col++) {
      if (board.value[row]?.[col] === CELL_TYPES.PLAYER || board.value[row]?.[col] === CELL_TYPES.PLAYER_ON_TARGET) {
        playerPos.value = { x: row, y: col }
        break
      }
    }
  }
}

// 获取显示用的棋盘（用于渲染）
const displayBoard = computed(() => {
  return board.value.map(row => [...row])
})

// 获取单元格的CSS类
const getCellClass = (cell: number) => {
  switch (cell) {
    case CELL_TYPES.EMPTY:
      return 'empty'
    case CELL_TYPES.WALL:
      return 'wall'
    case CELL_TYPES.BOX:
      return 'box'
    case CELL_TYPES.TARGET:
      return 'target'
    case CELL_TYPES.PLAYER:
      return 'player'
    case CELL_TYPES.BOX_ON_TARGET:
      return 'box-on-target'
    case CELL_TYPES.PLAYER_ON_TARGET:
      return 'player-on-target'
    default:
      return ''
  }
}

// 移动玩家
const movePlayer = (dx: number, dy: number) => {
  if (isWin.value) return
  
  const newX = playerPos.value.x + dx
  const newY = playerPos.value.y + dy
  
  // 检查边界
  if (newX < 0 || newX >= board.value.length || newY < 0 || newY >= (board.value[0]?.length || 0)) {
    return
  }
  
  const targetCell = board.value[newX]?.[newY]
  if (targetCell === undefined) {
    return
  }
  
  // 如果目标是墙，则不能移动
  if (targetCell === CELL_TYPES.WALL) {
    return
  }
  
  // 如果目标是箱子或箱子在目标位置
  if (targetCell === CELL_TYPES.BOX || targetCell === CELL_TYPES.BOX_ON_TARGET) {
    const boxNewX = newX + dx
    const boxNewY = newY + dy
    
    // 检查箱子能否被推动
    if (boxNewX < 0 || boxNewX >= board.value.length || boxNewY < 0 || boxNewY >= (board.value[0]?.length || 0)) {
      return
    }
    
    const boxTargetCell = board.value[boxNewX]?.[boxNewY]
    if (boxTargetCell === undefined) {
      return
    }
    
    // 如果箱子目标位置是墙或箱子，则不能推动
    if (boxTargetCell === CELL_TYPES.WALL || 
        boxTargetCell === CELL_TYPES.BOX || 
        boxTargetCell === CELL_TYPES.BOX_ON_TARGET) {
      return
    }
    
    // 推动箱子
    const newBoxType = boxTargetCell === CELL_TYPES.TARGET ? CELL_TYPES.BOX_ON_TARGET : CELL_TYPES.BOX
    if (board.value[boxNewX]) {
      board.value[boxNewX][boxNewY] = newBoxType
    }
    
    // 更新原箱子位置
    const oldBoxType = targetCell === CELL_TYPES.BOX ? CELL_TYPES.EMPTY : CELL_TYPES.TARGET
    if (board.value[newX]) {
      board.value[newX][newY] = oldBoxType
    }
  }
  
  // 移动玩家
  const oldPlayerType = (board.value[playerPos.value.x]?.[playerPos.value.y] === CELL_TYPES.PLAYER_ON_TARGET) 
    ? CELL_TYPES.TARGET 
    : CELL_TYPES.EMPTY
  
  const newPlayerType = (board.value[newX]?.[newY] === CELL_TYPES.TARGET || 
                        board.value[newX]?.[newY] === CELL_TYPES.BOX_ON_TARGET)
    ? CELL_TYPES.PLAYER_ON_TARGET
    : CELL_TYPES.PLAYER
  
  if (board.value[playerPos.value.x]) {
    // @ts-expect-error 确保访问是安全的
    board.value[playerPos.value.x][playerPos.value.y] = oldPlayerType
  }
  
  if (board.value[newX]) {
    board.value[newX][newY] = newPlayerType
  }
  
  playerPos.value = { x: newX, y: newY }
  
  // 增加步数
  steps.value++
  
  // 检查是否胜利
  checkWin()
}

// 检查是否胜利
const checkWin = () => {
  // 检查是否所有目标位置都有箱子
  let allTargetsFilled = true
  for (let row = 0; row < board.value.length; row++) {
    for (let col = 0; col < (board.value[row]?.length || 0); col++) {
      if (board.value[row]?.[col] === CELL_TYPES.TARGET) {
        allTargetsFilled = false
        break
      }
    }
    if (!allTargetsFilled) break
  }
  
  if (allTargetsFilled) {
    isWin.value = true
  }
}

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowUp':
      movePlayer(-1, 0)
      e.preventDefault()
      break
    case 'ArrowDown':
      movePlayer(1, 0)
      e.preventDefault()
      break
    case 'ArrowLeft':
      movePlayer(0, -1)
      e.preventDefault()
      break
    case 'ArrowRight':
      movePlayer(0, 1)
      e.preventDefault()
      break
  }
}

// 重置当前关卡
const resetLevel = () => {
  initLevel()
}

// 下一关
const nextLevel = () => {
  if (currentLevel.value < levels.length - 1) {
    currentLevel.value++
    initLevel()
  }
}

// 上一关
const prevLevel = () => {
  if (currentLevel.value > 0) {
    currentLevel.value--
    initLevel()
  }
}

// 检查是否为移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 监听窗口大小变化
const handleResize = () => {
  checkMobile()
}

// 初始化
onMounted(() => {
  initLevel()
  checkMobile()
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', handleResize)
})

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.sokoban-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 100%;
  box-sizing: border-box;
}

.game-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 500px;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;
}

.game-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.game-controls button {
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.game-controls button:hover {
  background-color: #e0e0e0;
}

.game-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-board {
  display: inline-block;
  border: 2px solid #333;
  background-color: #eee;
}

.board-row {
  display: flex;
}

.cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  box-sizing: border-box;
}

.cell.empty {
  background-color: #f9f9f9;
}

.cell.wall {
  background-color: #333;
}

.cell.target {
  background-color: #ffeb3b;
  border: 2px dashed #ff9800;
}

.cell.box {
  background-color: #795548;
  border-radius: 4px;
}

.cell.box-on-target {
  background-color: #4caf50;
  border-radius: 4px;
}

.cell.player {
  background-color: #2196f3;
  border-radius: 50%;
}

.cell.player-on-target {
  background-color: #9c27b0;
  border-radius: 50%;
}

.mobile-controls {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.control-row {
  display: flex;
  justify-content: center;
  margin: 5px 0;
}

.control-row button {
  width: 50px;
  height: 50px;
  margin: 0 5px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.win-overlay {
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

.win-message {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
}

.win-message h2 {
  margin-top: 0;
}

.win-message button {
  padding: 10px 20px;
  font-size: 16px;
  margin: 10px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #4caf50;
  color: white;
}

@media (max-width: 768px) {
  .cell {
    width: 30px;
    height: 30px;
  }
  
  .game-info {
    font-size: 16px;
  }
}
</style>