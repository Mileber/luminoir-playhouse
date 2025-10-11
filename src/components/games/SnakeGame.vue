<template>
  <div class="snake-game">
    <div class="container">
      <h1>贪吃蛇游戏</h1>
      <div class="game-info">
        <div class="score">得分: {{ score }}</div>
        <div class="high-score">最高分: {{ highScore }}</div>
        <div class="controls">
          <button @click="startGame" v-if="!gameRunning && !gameOver" class="start-btn">开始游戏</button>
          <button @click="pauseGame" v-if="gameRunning" class="pause-btn">暂停</button>
          <button @click="resetGame" class="reset-btn">重新开始</button>
        </div>
      </div>
      
      <div class="game-board" ref="gameBoard">
        <div 
          v-for="(row, rowIndex) in board" 
          :key="rowIndex"
          class="board-row"
        >
          <div 
            v-for="(cell, colIndex) in row" 
            :key="colIndex"
            class="cell"
            :class="getCellClass(cell)"
          >
          </div>
        </div>
      </div>
      
      <!-- 移动端控制按钮 -->
      <div class="mobile-controls" v-if="isMobile">
        <div class="control-row">
          <button @click="changeDirection('up')" class="control-btn up">↑</button>
        </div>
        <div class="control-row">
          <button @click="changeDirection('left')" class="control-btn left">←</button>
          <button @click="changeDirection('down')" class="control-btn down">↓</button>
          <button @click="changeDirection('right')" class="control-btn right">→</button>
        </div>
      </div>
      
      <div v-if="gameOver" class="game-over">
        游戏结束!
        <button @click="resetGame">重新开始</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 定义组件名称
defineOptions({
  name: 'SnakeGame'
})

// 游戏常量
const BOARD_SIZE = 15
const INITIAL_SPEED = 150
const MIN_SPEED = 50
const SPEED_DECREMENT = 2

// 游戏状态
const board = ref<number[][]>([])
const snake = ref<{ x: number; y: number }[]>([{ x: 7, y: 7 }])
const food = ref<{ x: number; y: number }>({ x: 5, y: 5 })
const direction = ref<'up' | 'down' | 'left' | 'right'>('right')
const nextDirection = ref<'up' | 'down' | 'left' | 'right'>('right')
const score = ref(0)
const highScore = ref(0)
const gameRunning = ref(false)
const gameOver = ref(false)
const gameSpeed = ref(INITIAL_SPEED)
const isMobile = ref(false)

// 游戏循环定时器
let gameLoop: number | null = null

// 初始化游戏板
const initBoard = () => {
  board.value = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0))
}

// 获取单元格类名
const getCellClass = (cellValue: number) => {
  return {
    'snake-head': cellValue === 2,
    'snake-body': cellValue === 1,
    'food': cellValue === 3,
    'empty': cellValue === 0
  }
}

// 初始化游戏
const initGame = () => {
  // 初始化游戏板
  initBoard()
  
  // 初始化蛇
  snake.value = [{ x: 7, y: 7 }]
  
  // 初始化方向
  direction.value = 'right'
  nextDirection.value = 'right'
  
  // 生成食物
  generateFood()
  
  // 重置分数
  score.value = 0
  gameSpeed.value = INITIAL_SPEED
  
  // 重置游戏状态
  gameOver.value = false
  
  // 更新游戏板
  updateBoard()
}

// 生成食物
const generateFood = () => {
  // 查找所有空位置
  const emptyCells: { x: number; y: number }[] = []
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      // 检查该位置是否为空
      let isOccupied = false
      for (const segment of snake.value) {
        if (segment.x === x && segment.y === y) {
          isOccupied = true
          break
        }
      }
      
      if (!isOccupied) {
        emptyCells.push({ x, y })
      }
    }
  }
  
  // 如果没有空位置，游戏胜利
  if (emptyCells.length === 0) {
    gameOver.value = true
    gameRunning.value = false
    if (gameLoop) {
      clearInterval(gameLoop)
      gameLoop = null
    }
    return
  }
  
  // 随机选择一个空位置放置食物
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  // @ts-expect-error 确保randomCell存在
  food.value = { x: randomCell.x, y: randomCell.y }
}

// 更新游戏板
const updateBoard = () => {
  // 清空游戏板
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board.value[y]) {
        // @ts-expect-error 确保访问是安全的
        board.value[y][x] = 0
      }
    }
  }
  
  // 绘制蛇身
  for (let i = 0; i < snake.value.length; i++) {
    const segment = snake.value[i]
    if (segment && board.value[segment.y] && segment.x !== undefined && segment.x >= 0 && 
        segment.x < BOARD_SIZE && segment.y !== undefined && segment.y >= 0 && segment.y < BOARD_SIZE) {
      // 蛇头
      if (i === 0) {
        if (board.value[segment.y] && segment.x !== undefined && segment.y !== undefined) {
          // @ts-expect-error 确保访问是安全的
          board.value[segment.y][segment.x] = 2
        }
      } else {
        // 蛇身
        if (board.value[segment.y] && segment.x !== undefined && segment.y !== undefined) {
          // @ts-expect-error 确保访问是安全的
          board.value[segment.y][segment.x] = 1
        }
      }
    }
  }
  
  // 绘制食物
  if (food.value && board.value[food.value.y] && food.value.x !== undefined && 
      food.value.x >= 0 && food.value.x < BOARD_SIZE && food.value.y !== undefined && 
      food.value.y >= 0 && food.value.y < BOARD_SIZE) {
    if (board.value[food.value.y] && food.value.x !== undefined && food.value.y !== undefined) {
      // @ts-expect-error 确保访问是安全的
      board.value[food.value.y][food.value.x] = 3
    }
  }
}

// 改变方向
const changeDirection = (newDirection: 'up' | 'down' | 'left' | 'right') => {
  // 防止反向移动
  if (
    (direction.value === 'up' && newDirection === 'down') ||
    (direction.value === 'down' && newDirection === 'up') ||
    (direction.value === 'left' && newDirection === 'right') ||
    (direction.value === 'right' && newDirection === 'left')
  ) {
    return
  }
  
  nextDirection.value = newDirection
}

// 移动蛇
const moveSnake = () => {
  // 更新方向
  direction.value = nextDirection.value
  
  // 获取蛇头
  const head = { ...snake.value[0] }
  
  // 根据方向移动蛇头
  switch (direction.value) {
    case 'up':
      if (head.y !== undefined) head.y -= 1
      break
    case 'down':
      if (head.y !== undefined) head.y += 1
      break
    case 'left':
      if (head.x !== undefined) head.x -= 1
      break
    case 'right':
      if (head.x !== undefined) head.x += 1
      break
  }
  
  // 检查是否撞墙
  if (head.x !== undefined && head.y !== undefined && 
      (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE)) {
    gameOverHandler()
    return
  }
  
  // 检查是否撞到自己
  for (let i = 0; i < snake.value.length; i++) {
    const segment = snake.value[i]
    if (segment && head.x !== undefined && head.y !== undefined &&
        segment.x === head.x && segment.y === head.y) {
      gameOverHandler()
      return
    }
  }
  
  // 将新头部添加到蛇身
  if (head.x !== undefined && head.y !== undefined) {
    snake.value.unshift({x: head.x, y: head.y})
  }
  
  // 检查是否吃到食物
  if (head.x !== undefined && head.y !== undefined && food.value &&
      head.x === food.value.x && head.y === food.value.y) {
    // 增加分数
    score.value += 10
    
    // 增加速度（但不低于最小速度）
    if (gameSpeed.value > MIN_SPEED) {
      gameSpeed.value -= SPEED_DECREMENT
      if (gameLoop) {
        clearInterval(gameLoop)
        gameLoop = null
      }
      gameLoop = window.setInterval(gameStep, gameSpeed.value)
    }
    
    // 生成新食物
    generateFood()
  } else {
    // 移除尾部
    snake.value.pop()
  }
  
  // 更新游戏板
  updateBoard()
}

// 游戏结束处理
const gameOverHandler = () => {
  gameOver.value = true
  gameRunning.value = false
  
  // 更新最高分
  if (score.value > highScore.value) {
    highScore.value = score.value
    // 保存最高分到localStorage
    try {
      localStorage.setItem('snakeHighScore', highScore.value.toString())
    } catch (e) {
      console.error('无法保存最高分到localStorage:', e)
    }
  }
  
  // 停止游戏循环
  if (gameLoop) {
    clearInterval(gameLoop)
    gameLoop = null
  }
}

// 游戏步骤
const gameStep = () => {
  if (gameRunning.value && !gameOver.value) {
    moveSnake()
  }
}

// 开始游戏
const startGame = () => {
  if (!gameRunning.value) {
    gameRunning.value = true
    if (!gameLoop) {
      gameLoop = window.setInterval(gameStep, gameSpeed.value)
    }
  }
}

// 暂停游戏
const pauseGame = () => {
  gameRunning.value = false
}

// 重置游戏
const resetGame = () => {
  // 停止当前游戏循环
  if (gameLoop) {
    clearInterval(gameLoop)
    gameLoop = null
  }
  
  // 初始化游戏
  initGame()
  
  // 开始新游戏
  gameRunning.value = true
  gameLoop = window.setInterval(gameStep, gameSpeed.value)
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowUp':
      changeDirection('up')
      break
    case 'ArrowDown':
      changeDirection('down')
      break
    case 'ArrowLeft':
      changeDirection('left')
      break
    case 'ArrowRight':
      changeDirection('right')
      break
    case ' ':
      if (gameOver.value) {
        resetGame()
      } else if (gameRunning.value) {
        pauseGame()
      } else {
        startGame()
      }
      break
  }
}

// 检查是否为移动设备
const checkIsMobile = () => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 组件挂载时
onMounted(() => {
  // 检查是否为移动设备
  checkIsMobile()
  
  // 初始化游戏
  initGame()
  
  // 加载最高分
  try {
    const savedHighScore = localStorage.getItem('snakeHighScore')
    if (savedHighScore) {
      highScore.value = parseInt(savedHighScore, 10)
    }
  } catch (e) {
    console.error('无法从localStorage加载最高分:', e)
  }
  
  // 添加键盘事件监听器
  window.addEventListener('keydown', handleKeyDown)
})

// 组件卸载前
onUnmounted(() => {
  // 清理游戏循环
  if (gameLoop) {
    clearInterval(gameLoop)
    gameLoop = null
  }
  
  // 移除键盘事件监听器
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.snake-game {
  display: flex;
  justify-content: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.container {
  max-width: 500px;
  width: 100%;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.score, .high-score {
  font-weight: bold;
  font-size: 18px;
}

.controls {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.start-btn {
  background-color: #4CAF50;
  color: white;
}

.pause-btn {
  background-color: #FF9800;
  color: white;
}

.reset-btn {
  background-color: #2196F3;
  color: white;
}

.game-board {
  display: inline-block;
  border: 2px solid #333;
  background-color: #f0f0f0;
  margin-bottom: 20px;
}

.board-row {
  display: flex;
}

.cell {
  width: 25px;
  height: 25px;
  border: 1px solid #ddd;
}

.snake-head {
  background-color: #4CAF50;
  border-radius: 4px;
}

.snake-body {
  background-color: #8BC34A;
  border-radius: 2px;
}

.food {
  background-color: #f44336;
  border-radius: 50%;
}

.game-over {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #f44336;
  margin: 20px 0;
}

.game-over button {
  display: block;
  margin: 10px auto;
  padding: 10px 20px;
  background-color: #2196F3;
  color: white;
  font-size: 16px;
}

.mobile-controls {
  display: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .mobile-controls {
    display: block;
    margin-top: 20px;
  }
  
  .control-row {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .control-btn {
    width: 60px;
    height: 60px;
    font-size: 24px;
    border: none;
    border-radius: 50%;
    background-color: #2196F3;
    color: white;
    cursor: pointer;
  }
  
  .control-btn:active {
    background-color: #0b7dda;
  }
  
  .cell {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .cell {
    width: 15px;
    height: 15px;
  }
  
  .control-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>