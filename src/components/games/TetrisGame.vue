<template>
  <div class="tetris-game">
    <div class="game-info">
      <div>Score: {{ score }}</div>
      <div>Next Piece:</div>
      <canvas ref="nextCanvas" class="next-piece" width="120" height="120"></canvas>
      <div v-if="gameOver">Game Over!</div>
      <button @click="resetGame" v-if="gameOver">New Game</button>
    </div>
    <canvas ref="tetrisCanvas" class="game-canvas" width="600" height="800"></canvas>
    
    <!-- 移动端控制按钮 -->
    <div class="mobile-controls" v-if="isMobile">
      <button @touchstart.prevent="playerRotate(-1)" @mousedown="playerRotate(-1)">↻ Left</button>
      <button @touchstart.prevent="playerMove(-1)" @mousedown="playerMove(-1)">← Left</button>
      <button @touchstart.prevent="playerMove(1)" @mousedown="playerMove(1)">Right →</button>
      <button @touchstart.prevent="playerRotate(1)" @mousedown="playerRotate(1)">Right ↺</button>
      <button @touchstart.prevent="playerDrop" @mousedown="playerDrop">↓ Drop</button>
      <button @touchstart.prevent="playerHardDrop" @mousedown="playerHardDrop">⤓ Hard Drop</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

// 游戏常量
const ARENA_WIDTH = 15
const ARENA_HEIGHT = 20
const SCALE = 40
const DROP_INTERVAL = 1000

// 游戏变量
const tetrisCanvas = ref<HTMLCanvasElement | null>(null)
const nextCanvas = ref<HTMLCanvasElement | null>(null)
const score = ref(0)
const gameOver = ref(false)

// 检测是否为移动端
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

// 游戏区域
let arena: number[][] = []
// 当前方块
const player: {
  pos: { x: number; y: number }
  matrix: number[][]
  score: number
} = {
  pos: { x: 0, y: 0 },
  matrix: [],
  score: 0
}

// 下一个方块
let nextPiece: number[][] = []

// 游戏时间控制
let dropCounter = 0
let dropInterval = DROP_INTERVAL
let lastTime = 0

// 方块类型
const PIECES = {
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  O: [
    [2, 2],
    [2, 2]
  ],
  L: [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0]
  ],
  J: [
    [4, 0, 0],
    [4, 4, 4],
    [0, 0, 0]
  ],
  I: [
    [0, 5, 0, 0],
    [0, 5, 0, 0],
    [0, 5, 0, 0],
    [0, 5, 0, 0]
  ],
  S: [
    [0, 6, 6],
    [6, 6, 0],
    [0, 0, 0]
  ],
  Z: [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0]
  ]
}

// 方块颜色映射
const COLORS = [
  null,
  '#FF0D72', // T
  '#0DC2FF', // O
  '#0DFF72', // L
  '#F538FF', // J
  '#FF8E0D', // I
  '#FFE138', // S
  '#3877FF'  // Z
]

// 初始化游戏区域
const createMatrix = (width: number, height: number): number[][] => {
  const matrix: number[][] = []
  while (height--) {
    matrix.push(new Array(width).fill(0))
  }
  return matrix
}

// 创建随机方块
const createPiece = (): number[][] => {
  const pieces = 'TOLJISZ'
  const rand = pieces[Math.floor(Math.random() * pieces.length)] as keyof typeof PIECES
  return JSON.parse(JSON.stringify(PIECES[rand]))
}

// 旋转矩阵
const rotate = (matrix: number[][]): number[][] => {
  // 确保矩阵不为空
  if (matrix.length === 0 || !matrix[0] || matrix[0].length === 0) {
    return matrix;
  }
  
  // 创建矩阵的转置
  const rotated: number[][] = [];
  
  // 初始化转置矩阵
  for (let i = 0; i < matrix[0].length; i++) {
    rotated[i] = new Array(matrix.length).fill(0);
  }
  
  // 填充转置矩阵
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[0].length; x++) {
      // @ts-expect-error: 确保在循环中访问的元素存在
      rotated[x][matrix.length - 1 - y] = matrix[y][x];
    }
  }
  
  return rotated;
}

// 碰撞检测
const collide = (arena: number[][], player: { pos: { x: number; y: number }; matrix: number[][] }): boolean => {
  const [m, o] = [player.matrix, player.pos]
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < (m[0] ? m[0].length : 0); ++x) {
      // @ts-expect-error: 确保在循环中访问的元素存在
      if (m[y] && m[y][x] !== 0 && 
         // @ts-expect-error: 确保在循环中访问的元素存在
         (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true
      }
    }
  }
  return false
}

// 合并方块到游戏区域
const merge = (arena: number[][], player: { pos: { x: number; y: number }; matrix: number[][] }): void => {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        // @ts-expect-error: 确保在循环中访问的元素存在
        if (arena[y + player.pos.y] && arena[y + player.pos.y][x + player.pos.x] !== undefined) {
          // @ts-expect-error: 确保在循环中访问的元素存在
          arena[y + player.pos.y][x + player.pos.x] = value
        }
      }
    })
  })
}

// 清除满行
const arenaSweep = (): void => {
  let rowCount = 1
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < (arena[0] ? arena[0].length : 0); ++x) {
      // @ts-expect-error: 确保在循环中访问的元素存在
      if (arena[y] && arena[y][x] === 0) {
        continue outer
      }
    }

    if (arena[y]) {
      // @ts-expect-error: 确保splice返回的数组元素存在
      const row = arena.splice(y, 1)[0].fill(0)
      arena.unshift(row)
      ++y

      score.value += rowCount * 10
      rowCount *= 2
    }
  }
}

// 重置玩家
const playerReset = (): void => {
  player.matrix = nextPiece
  nextPiece = createPiece()
  player.pos.y = 0
  if (arena[0] && player.matrix[0]) {
    player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2)
  }
  
  // 检查游戏结束
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0))
    score.value = 0
    gameOver.value = true
  }
  
  drawNextPiece()
}

// 玩家移动
const playerMove = (dir: number): void => {
  player.pos.x += dir
  if (collide(arena, player)) {
    player.pos.x -= dir
  }
}

// 玩家旋转
const playerRotate = (dir: number): void => {
  const pos = player.pos.x
  let offset = dir  // 使用传入的dir参数
  const originalMatrix = player.matrix
  player.matrix = rotate(player.matrix)
  
  while (collide(arena, player)) {
    player.pos.x += offset
    offset = -(offset + (offset > 0 ? 1 : -1))
    const matrixWidth = player.matrix[0] ? player.matrix[0].length : 0
    if (Math.abs(offset) > matrixWidth) {
      player.matrix = originalMatrix
      player.pos.x = pos
      return
    }
  }
}

// 玩家下落
const playerDrop = (): void => {
  player.pos.y++
  if (collide(arena, player)) {
    player.pos.y--
    merge(arena, player)
    playerReset()
    arenaSweep()
    dropInterval = DROP_INTERVAL
  }
  dropCounter = 0
}

// 玩家快速下落
const playerHardDrop = (): void => {
  while (!collide(arena, player)) {
    player.pos.y++
  }
  player.pos.y--
  playerDrop()
}

// 绘制游戏区域
const drawMatrix = (matrix: number[][], offset: { x: number; y: number }, canvas: HTMLCanvasElement): void => {
  const context = canvas.getContext('2d')
  if (!context) return

  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = COLORS[value] as string
        context.fillRect((x + offset.x) * SCALE, (y + offset.y) * SCALE, SCALE, SCALE)
        
        // 添加黑色边框
        context.strokeStyle = '#000'
        context.strokeRect((x + offset.x) * SCALE, (y + offset.y) * SCALE, SCALE, SCALE)
      }
    })
  })
}

// 绘制下一个方块
const drawNextPiece = (): void => {
  const canvas = nextCanvas.value
  if (!canvas) return
  
  const context = canvas.getContext('2d')
  if (!context) return
  
  // 清空画布
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  // 计算居中位置
  const offsetX = nextPiece[0] ? (canvas.width / SCALE - nextPiece[0].length) / 2 : 0
  const offsetY = (canvas.height / SCALE - nextPiece.length) / 2
  
  // 绘制方块
  drawMatrix(nextPiece, { x: offsetX, y: offsetY }, canvas)
}

// 绘制游戏
const draw = (): void => {
  const canvas = tetrisCanvas.value
  if (!canvas) return
  
  const context = canvas.getContext('2d')
  if (!context) return
  
  // 清空画布
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  // 绘制游戏区域
  drawMatrix(arena, { x: 0, y: 0 }, canvas)
  drawMatrix(player.matrix, player.pos, canvas)
}

// 更新游戏状态
const update = (time = 0): void => {
  if (gameOver.value) return
  
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime
  if (dropCounter > dropInterval) {
    playerDrop()
  }

  draw()
  requestAnimationFrame(update)
}

// 初始化游戏
const init = (): void => {
  arena = createMatrix(ARENA_WIDTH, ARENA_HEIGHT)
  
  player.score = 0
  player.pos = { x: 0, y: 0 }
  player.matrix = createPiece()
  
  nextPiece = createPiece()
  
  gameOver.value = false
  score.value = 0
  
  drawNextPiece()
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent): void => {
  if (gameOver.value) return
  
  switch (e.key) {
    case 'ArrowLeft':
      playerMove(-1)
      break
    case 'ArrowRight':
      playerMove(1)
      break
    case 'ArrowDown':
      playerDrop()
      break
    case 'ArrowUp':
      playerRotate(1)
      break
    case 'q':
      playerRotate(-1)
      break
    case 'w':
      playerRotate(1)
      break
    case ' ':
      playerHardDrop()
      break
  }
}

// 重置游戏
const resetGame = (): void => {
  init()
  gameOver.value = false
  requestAnimationFrame(update)
}

onMounted(() => {
  init()
  
  window.addEventListener('keydown', handleKeyDown)
  requestAnimationFrame(update)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.tetris-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #222;
  height: 100%;
  position: relative;
  padding: 20px;
  box-sizing: border-box;
  min-height: 100vh;
}

.game-info {
  position: static;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  z-index: 10;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  border-radius: 5px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
}

.next-piece {
  border: 1px solid #000;
  background-color: #000;
  margin: 10px auto;
}

.game-canvas {
  border: 1px solid #000;
  background-color: #000;
  margin: auto;
  max-width: 100%;
  height: auto;
}

button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .tetris-game {
    padding: 10px;
  }
  
  .game-info {
    padding: 8px 15px;
    font-size: 14px;
  }
  
  .game-canvas {
    width: 100%;
    max-width: 350px;
    height: auto;
  }
  
  .next-piece {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .tetris-game {
    padding: 5px;
  }
  
  .game-info {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .game-canvas {
    width: 100%;
    max-width: 300px;
    height: auto;
  }
  
  .next-piece {
    width: 80px;
    height: 80px;
  }
}

.mobile-controls {
  display: none;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
  width: 100%;
  max-width: 600px;
}

.mobile-controls button {
  padding: 15px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  transition: background-color 0.3s ease;
}

.mobile-controls button:hover {
  background-color: #45a049;
}

/* 在移动端显示控制按钮 */
@media (max-width: 768px) {
  .mobile-controls {
    display: grid;
  }
  
  .mobile-controls {
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
    max-width: 350px;
  }
  
  .mobile-controls button {
    padding: 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .mobile-controls {
    grid-template-columns: repeat(2, 1fr);
    max-width: 300px;
  }
  
  .mobile-controls button {
    padding: 10px;
    font-size: 12px;
  }
}
</style>
