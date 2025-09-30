<template>
  <div class="game-2048">
    <div class="container">
      <h1>2048 Game</h1>
      <div class="score">Score: {{ score }}</div>
      <div class="grid">
        <div 
          v-for="(row, i) in grid" 
          :key="i"
          class="grid-row"
        >
          <div 
            v-for="(cell, j) in row" 
            :key="j"
            class="cell"
            :class="{ 
              'empty': cell === 0,
              'tile-2': cell === 2,
              'tile-4': cell === 4,
              'tile-8': cell === 8,
              'tile-16': cell === 16,
              'tile-32': cell === 32,
              'tile-64': cell === 64,
              'tile-128': cell === 128,
              'tile-256': cell === 256,
              'tile-512': cell === 512,
              'tile-1024': cell === 1024,
              'tile-2048': cell === 2048
            }"
          >
            {{ cell !== 0 ? cell : '' }}
          </div>
        </div>
      </div>
      <div class="button-container">
        <button @click="move('up')" class="up-button">↑</button>
        <button @click="move('left')" class="left-button">←</button>
        <button @click="move('right')" class="right-button">→</button>
        <button @click="move('down')" class="down-button">↓</button>
      </div>
      <div v-if="gameOver" class="game-over">
        Game Over!
        <button @click="resetGame">New Game</button>
      </div>
      <div v-if="win" class="win">
        You Win!
        <button @click="resetGame">New Game</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 定义组件名称为多词组合
defineOptions({
  name: 'GameTwentyFortyEight'
})

// 游戏网格
const grid = ref<number[][]>([
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
])

// 游戏状态
const score = ref(0)
const gameOver = ref(false)
const win = ref(false)

// 初始化游戏
const initGame = () => {
  // 重置网格
  grid.value = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  // 重置状态
  score.value = 0
  gameOver.value = false
  win.value = false
  
  // 添加两个随机方块
  addRandomTile()
  addRandomTile()
}

// 添加随机方块
const addRandomTile = () => {
  // 查找所有空位置
  const emptyCells: { row: number; col: number }[] = []
  for (let i = 0; i < 4; i++) {
    const gridRow = grid.value[i];
    if (!gridRow) continue;

    for (let j = 0; j < 4; j++) {
      if (gridRow[j] === 0) {
        emptyCells.push({ row: i, col: j })
      }
    }
  }

  // 如果没有空位置，直接返回
  if (emptyCells.length === 0) return

  // 随机选择一个空位置
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]

  // 90%概率生成2，10%概率生成4
  const value = Math.random() < 0.9 ? 2 : 4

  // 在随机位置放置值
  if (randomCell) {
    const gridRow = grid.value[randomCell.row];
    if (gridRow) {
      gridRow[randomCell.col] = value
    }
  }
}

// 移动函数
const move = (direction: 'up' | 'down' | 'left' | 'right') => {
  if (gameOver.value || win.value) return

  let moved = false

  // 根据方向执行移动
  switch (direction) {
    case 'up':
      moved = moveUp()
      break
    case 'down':
      moved = moveDown()
      break
    case 'left':
      moved = moveLeft()
      break
    case 'right':
      moved = moveRight()
      break
  }

  // 如果有移动，则添加新方块并检查游戏状态
  if (moved) {
    addRandomTile()
    checkGameState()
  }
}

// 向左移动
const moveLeft = (): boolean => {
  let moved = false

  for (let i = 0; i < 4; i++) {
    // 获取当前行并移除0
    const currentRow = grid.value[i];
    const row = currentRow ? currentRow.filter(val => val !== 0) : []

    // 合并相同相邻元素
    for (let j = 0; j < row.length - 1; j++) {
      if (row[j] !== undefined && row[j] === row[j + 1]) {
        row[j] = (row[j] || 0) * 2
        score.value += row[j] || 0
        row.splice(j + 1, 1)
      }
    }

    // 补充0到长度为4
    while (row.length < 4) {
      row.push(0)
    }

    // 检查是否有变化
    const gridRow = grid.value[i];
    if (gridRow) {
      for (let j = 0; j < 4; j++) {
        if (gridRow[j] !== row[j]) {
          moved = true
        }

        gridRow[j] = row[j] || 0
      }
    }
  }

  return moved
}

// 向右移动
const moveRight = (): boolean => {
  let moved = false

  for (let i = 0; i < 4; i++) {
    // 获取当前行并移除0
    const currentRow = grid.value[i];
    const row = currentRow ? currentRow.filter(val => val !== 0) : []

    // 合并相同相邻元素（从右向左）
    for (let j = row.length - 1; j > 0; j--) {
      if (row[j] !== undefined && row[j] === row[j - 1]) {
        row[j] = (row[j] || 0) * 2
        score.value += row[j] || 0
        row.splice(j - 1, 1)
        j-- // 调整索引
      }
    }

    // 在前面补充0到长度为4
    while (row.length < 4) {
      row.unshift(0)
    }

    // 检查是否有变化
    for (let j = 0; j < 4; j++) {
      const currentRow = grid.value[i];
      if (currentRow && currentRow[j] !== row[j]) {
        moved = true
      }

      if (currentRow) {
        currentRow[j] = row[j] || 0
      }
    }
  }

  return moved
}

// 向上移动
const moveUp = (): boolean => {
  let moved = false

  for (let j = 0; j < 4; j++) {
    // 获取当前列并移除0
    const column: number[] = []
    for (let i = 0; i < 4; i++) {
      const gridRow = grid.value[i];
      if (!gridRow) continue;

      if (gridRow[j] !== 0) {
        column.push(gridRow[j] || 0)
      }
    }

    // 合并相同相邻元素
    for (let i = 0; i < column.length - 1; i++) {
      if (column[i] !== undefined && column[i] === column[i + 1]) {
        column[i] = (column[i] || 0) * 2
        score.value += column[i] || 0
        column.splice(i + 1, 1)
      }
    }

    // 补充0到长度为4
    while (column.length < 4) {
      column.push(0)
    }

    // 检查是否有变化
    for (let i = 0; i < 4; i++) {
      const gridRow = grid.value[i];
      if (!gridRow) continue;

      if (gridRow[j] !== column[i]) {
        moved = true
      }

      gridRow[j] = column[i] || 0
    }
  }

  return moved
}

// 向下移动
const moveDown = (): boolean => {
  let moved = false

  for (let j = 0; j < 4; j++) {
    // 获取当前列并移除0
    const column: number[] = []
    for (let i = 0; i < 4; i++) {
      const gridRow = grid.value[i];
      if (!gridRow) continue;

      if (gridRow[j] !== 0) {
        column.push(gridRow[j] || 0)
      }
    }

    // 合并相同相邻元素（从下向上）
    for (let i = column.length - 1; i > 0; i--) {
      if (column[i] !== undefined && column[i] === column[i - 1]) {
        column[i] = (column[i] || 0) * 2
        score.value += column[i] || 0
        column.splice(i - 1, 1)
        i-- // 调整索引
      }
    }

    // 在前面补充0到长度为4
    while (column.length < 4) {
      column.unshift(0)
    }

    // 检查是否有变化
    for (let i = 0; i < 4; i++) {
      const gridRow = grid.value[i];
      if (!gridRow) continue;

      if (gridRow[j] !== column[i]) {
        moved = true
      }

      gridRow[j] = column[i] || 0
    }
  }

  return moved
}

// 检查游戏状态
const checkGameState = (): void => {
  // 检查是否获胜
  for (let i = 0; i < 4; i++) {
    const row = grid.value[i];
    if (!row) continue;

    for (let j = 0; j < 4; j++) {
      if (row[j] === 2048) {
        win.value = true
        return
      }
    }
  }

  // 检查是否还有空位置
  for (let i = 0; i < 4; i++) {
    const row = grid.value[i];
    if (!row) continue;

    for (let j = 0; j < 4; j++) {
      if (row[j] === 0) {
        return
      }
    }
  }

  // 检查是否还能合并
  for (let i = 0; i < 4; i++) {
    const row = grid.value[i];
    if (!row) continue;

    for (let j = 0; j < 3; j++) {
      if (row[j] !== undefined &&
        row[j + 1] !== undefined &&
        row[j] === row[j + 1]) {
        return
      }
    }
  }

  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 3; i++) {
      const row = grid.value[i];
      const nextRow = grid.value[i + 1];
      if (!row || !nextRow) continue;

      if (row[j] !== undefined &&
        nextRow[j] !== undefined &&
        row[j] === nextRow[j]) {
        return
      }
    }
  }

  // 如果没有空位置且不能合并，则游戏结束
  gameOver.value = true
}

// 重置游戏
const resetGame = () => {
  initGame()
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowUp':
      move('up')
      break
    case 'ArrowDown':
      move('down')
      break
    case 'ArrowLeft':
      move('left')
      break
    case 'ArrowRight':
      move('right')
      break
  }
}

// 触摸事件处理
let touchStartX = 0
let touchStartY = 0
const handleTouchStart = (e: TouchEvent): void => {
  const touch = e.touches[0];
  if (!touch) return;

  touchStartX = touch.clientX
  touchStartY = touch.clientY
}

const handleTouchEnd = (e: TouchEvent): void => {
  if (gameOver.value || win.value) return

  const touch = e.changedTouches[0];
  if (!touch) return;

  const touchEndX = touch.clientX
  const touchEndY = touch.clientY

  const dx = touchEndX - touchStartX
  const dy = touchEndY - touchStartY

  // 确定主要的移动方向
  if (Math.abs(dx) > Math.abs(dy)) {
    // 水平滑动
    if (dx > 50) {
      move('right') // 右滑
    } else if (dx < -50) {
      move('left') // 左滑
    }
  } else {
    // 垂直滑动
    if (dy > 50) {
      move('down') // 下滑
    } else if (dy < -50) {
      move('up') // 上滑
    }
  }
}

// 初始化游戏
onMounted(() => {
  initGame()
  window.addEventListener('keydown', handleKeyDown)

  // 添加触摸事件监听
  const gridElement = document.querySelector('.grid')
  if (gridElement) {
    gridElement.addEventListener('touchstart', handleTouchStart as EventListener)
    gridElement.addEventListener('touchend', handleTouchEnd as EventListener)
  }
})

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)

  // 移除触摸事件监听
  const gridElement = document.querySelector('.grid')
  if (gridElement) {
    gridElement.removeEventListener('touchstart', handleTouchStart as EventListener)
    gridElement.removeEventListener('touchend', handleTouchEnd as EventListener)
  }
})
</script>

<!-- eslint-disable vue/multi-word-component-names -->
<style scoped>
.game-2048 {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #ffffff;
  font-family: avenir, sans-serif;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
}

h1 {
  color: #333;
  font-size: 1.5em;
  margin-bottom: 10px;
}

.score {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.grid {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  gap: 6px;
  background-color: #bbada0;
  padding: 12px;
  border-radius: 10px;
  width: 300px;
  height: 300px;
  box-sizing: border-box;
  margin-bottom: 20px;
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.cell {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 20px;
  border-radius: 5px;
  background-color: #ccc0b3;
  color: #776e65;
  transition: all 0.15s ease;
}

.cell.empty {
  background-color: #cdc1b4;
}

.cell.tile-2 {
  background-color: #eee4da;
  color: #776e65;
}

.cell.tile-4 {
  background-color: #ede0c8;
  color: #776e65;
}

.cell.tile-8 {
  background-color: #f2b179;
  color: #f9f6f2;
}

.cell.tile-16 {
  background-color: #f59563;
  color: #f9f6f2;
}

.cell.tile-32 {
  background-color: #f67c5f;
  color: #f9f6f2;
}

.cell.tile-64 {
  background-color: #f65e3b;
  color: #f9f6f2;
}

.cell.tile-128 {
  background-color: #edcf72;
  color: #f9f6f2;
  font-size: 18px;
}

.cell.tile-256 {
  background-color: #edcc61;
  color: #f9f6f2;
  font-size: 18px;
}

.cell.tile-512 {
  background-color: #edc850;
  color: #f9f6f2;
  font-size: 18px;
}

.cell.tile-1024 {
  background-color: #edc53f;
  color: #f9f6f2;
  font-size: 14px;
}

.cell.tile-2048 {
  background-color: #edc22e;
  color: #f9f6f2;
  font-size: 14px;
}

.button-container {
  display: grid;
  grid-template-columns: repeat(3, 60px);
  grid-template-rows: repeat(2, 60px);
  gap: 10px;
  margin-top: 20px;
}

.button-container button {
  background-color: #f57c00;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-container button:hover {
  background-color: #fb8c00;
  transform: scale(1.05);
}

.up-button {
  grid-column: 2;
  grid-row: 1;
}

.left-button {
  grid-column: 1;
  grid-row: 2;
}

.right-button {
  grid-column: 3;
  grid-row: 2;
}

.down-button {
  grid-column: 2;
  grid-row: 2;
}

.game-over,
.win {
  margin-top: 20px;
  font-size: 1.5em;
  font-weight: bold;
  text-align: center;
  color: #333;
}

.game-over button,
.win button {
  display: block;
  margin: 10px auto 0;
  padding: 10px 20px;
  background-color: #f57c00;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.game-over button:hover,
.win button:hover {
  background-color: #fb8c00;
  transform: scale(1.05);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .grid {
    width: 250px;
    height: 250px;
  }
  
  .cell {
    width: 50px;
    height: 50px;
    font-size: 18px;
  }
  
  .cell.tile-128,
  .cell.tile-256,
  .cell.tile-512 {
    font-size: 16px;
  }
  
  .cell.tile-1024,
  .cell.tile-2048 {
    font-size: 12px;
  }
  
  .button-container {
    grid-template-columns: repeat(3, 50px);
    grid-template-rows: repeat(2, 50px);
    gap: 8px;
  }
  
  .button-container button {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .grid {
    width: 200px;
    height: 200px;
  }
  
  .cell {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
  
  .cell.tile-128,
  .cell.tile-256,
  .cell.tile-512 {
    font-size: 12px;
  }
  
  .cell.tile-1024,
  .cell.tile-2048 {
    font-size: 10px;
  }
  
  .button-container {
    grid-template-columns: repeat(3, 40px);
    grid-template-rows: repeat(2, 40px);
    gap: 6px;
  }
  
  .button-container button {
    font-size: 16px;
  }
  
  h1 {
    font-size: 1.2em;
  }
  
  .score {
    font-size: 1em;
  }
}
</style>