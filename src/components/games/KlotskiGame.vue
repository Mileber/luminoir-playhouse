<template>
  <div class="klotski-game">
    <div class="container">
      <h1>华容道</h1>
      <div class="game-info">
        <div class="moves">步数: {{ moves }}</div>
        <div class="controls">
          <button @click="initGame" class="restart-btn">重新开始</button>
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
      
      <div v-if="gameCompleted" class="game-completed">
        <h2>恭喜你完成了华容道！</h2>
        <p>总共用了 {{ moves }} 步</p>
        <button @click="initGame" class="play-again-btn">再玩一次</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// 定义组件名称
defineOptions({
  name: 'KlotskiGame'
})

// 游戏常量
const BOARD_ROWS = 5
const BOARD_COLS = 4

// 方块类型枚举
enum BlockType {
  EMPTY = 0,
  CAOCAO = 1,     // 2x2曹操方块
  GENERAL_V = 2,  // 1x2竖直大将方块
  GENERAL_H = 3,  // 1x2水平大将方块
  SOLDIER = 4     // 1x1士兵方块
}

// 方块接口
interface Block {
  id: number
  type: BlockType
  row: number
  col: number
}

// 游戏状态
const board = ref<number[][]>([])
const blocks = reactive<Block[]>([])
const moves = ref(0)
const gameCompleted = ref(false)
const selectedBlock = ref<number | null>(null)

// 初始化游戏
const initGame = () => {
  // 重置游戏状态
  moves.value = 0
  gameCompleted.value = false
  selectedBlock.value = null
  
  // 清空游戏板
  board.value.length = 0
  
  // 初始化空的游戏板
  for (let row = 0; row < BOARD_ROWS; row++) {
    const rowCells: number[] = []
    for (let col = 0; col < BOARD_COLS; col++) {
      rowCells.push(BlockType.EMPTY)
    }
    board.value.push(rowCells)
  }
  
  // 清空方块
  blocks.length = 0
  
  // 初始化经典"横刀立马"布局
  // 第一行
  blocks.push({ id: 1, type: BlockType.GENERAL_V, row: 0, col: 0 })  // 关羽
  blocks.push({ id: 2, type: BlockType.GENERAL_V, row: 0, col: 1 })  // 张飞
  blocks.push({ id: 3, type: BlockType.GENERAL_V, row: 0, col: 2 })  // 赵云
  blocks.push({ id: 4, type: BlockType.GENERAL_V, row: 0, col: 3 })  // 马超
  
  // 第二行
  blocks.push({ id: 5, type: BlockType.GENERAL_H, row: 1, col: 0 })  // 黄忠
  blocks.push({ id: 6, type: BlockType.CAOCAO, row: 1, col: 1 })     // 曹操
  blocks.push({ id: 7, type: BlockType.SOLDIER, row: 1, col: 3 })    // 士兵
  
  // 第三行
  blocks.push({ id: 8, type: BlockType.SOLDIER, row: 2, col: 0 })    // 士兵
  blocks.push({ id: 9, type: BlockType.SOLDIER, row: 2, col: 1 })    // 士兵
  blocks.push({ id: 10, type: BlockType.GENERAL_H, row: 2, col: 2 }) // 关羽
  
  // 第四行
  blocks.push({ id: 11, type: BlockType.GENERAL_V, row: 3, col: 0 }) // 赵云
  blocks.push({ id: 12, type: BlockType.GENERAL_V, row: 3, col: 1 }) // 马超
  blocks.push({ id: 13, type: BlockType.GENERAL_H, row: 3, col: 2 }) // 黄忠
  
  // 第五行
  blocks.push({ id: 14, type: BlockType.SOLDIER, row: 4, col: 0 })   // 士兵
  blocks.push({ id: 15, type: BlockType.SOLDIER, row: 4, col: 3 })   // 士兵 (出口位置)
  
  // 更新游戏板
  updateBoard()
}

// 更新游戏板
const updateBoard = () => {
  // 清空游戏板
  for (let row = 0; row < BOARD_ROWS; row++) {
    if (!board.value[row]) continue;
    for (let col = 0; col < BOARD_COLS; col++) {
      // @ts-expect-error 确保访问是安全的
      if (col < board.value[row].length) {
        // @ts-expect-error 确保访问是安全的
        board.value[row][col] = BlockType.EMPTY
      }
    }
  }
  
  // 绘制所有方块
  for (const block of blocks) {
    drawBlock(block)
  }
}

// 绘制单个方块
const drawBlock = (block: Block) => {
  const { type, row, col } = block
  
  switch (type) {
    case BlockType.CAOCAO: // 2x2方块
      if (board.value[row] && col < board.value[row].length) {
        board.value[row][col] = block.id
      }
      if (board.value[row] && (col + 1) < board.value[row].length) {
        board.value[row][col + 1] = block.id
      }
      // 检查边界和数组访问安全性
      // @ts-expect-error 确保访问是安全的
      if (row + 1 < BOARD_ROWS && board.value[row + 1] && col < board.value[row + 1].length && (col + 1) < board.value[row + 1].length) {
        // @ts-expect-error 确保访问是安全的
        board.value[row + 1][col] = block.id
        // @ts-expect-error 确保访问是安全的
        board.value[row + 1][col + 1] = block.id
      }
      break
      
    case BlockType.GENERAL_V: // 2x1竖直方块
      if (board.value[row] && col < board.value[row].length) {
        board.value[row][col] = block.id
      }
      // 检查边界和数组访问安全性
      // @ts-expect-error 确保访问是安全的
      if ((row + 1) < BOARD_ROWS && board.value[row + 1] && col < board.value[row + 1].length) {
        // @ts-expect-error 确保访问是安全的
        board.value[row + 1][col] = block.id
      }
      break
      
    case BlockType.GENERAL_H: // 1x2水平方块
      if (board.value[row] && col < board.value[row].length) {
        board.value[row][col] = block.id
      }
      if (board.value[row] && (col + 1) < board.value[row].length) {
        board.value[row][col + 1] = block.id
      }
      break
      
    case BlockType.SOLDIER: // 1x1方块
      if (board.value[row] && col < board.value[row].length) {
        board.value[row][col] = block.id
      }
      break
  }
}

// 获取单元格类名
const getCellClass = (cellValue: number) => {
  if (cellValue === BlockType.EMPTY) {
    return 'empty'
  }
  
  // 根据方块ID找到对应的方块类型
  const block = blocks.find((b: Block) => b.id === cellValue)
  if (!block) return 'empty'
  
  switch (block.type) {
    case BlockType.CAOCAO:
      return `block caocao block-${cellValue}`
    case BlockType.GENERAL_V:
      return `block general-v block-${cellValue}`
    case BlockType.GENERAL_H:
      return `block general-h block-${cellValue}`
    case BlockType.SOLDIER:
      return `block soldier block-${cellValue}`
    default:
      return 'empty'
  }
}

// 组件挂载时初始化游戏
onMounted(() => {
  initGame()
})
</script>

<style scoped>
.klotski-game {
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

.moves {
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

.restart-btn, .play-again-btn {
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
  width: 60px;
  height: 60px;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.empty {
  background-color: #f0f0f0;
}

.block {
  border: 1px solid #333;
  cursor: pointer;
}

.caocao {
  background-color: #ffeb3b;
  width: 120px;
  height: 120px;
}

.general-v {
  background-color: #4caf50;
  width: 60px;
  height: 120px;
}

.general-h {
  background-color: #2196f3;
  width: 120px;
  height: 60px;
}

.soldier {
  background-color: #ff9800;
  width: 60px;
  height: 60px;
}

.game-completed {
  text-align: center;
  padding: 20px;
  background-color: #e8f5e9;
  border-radius: 8px;
}

.game-completed h2 {
  margin-top: 0;
  color: #2e7d32;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .cell {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .caocao {
    width: 100px;
    height: 100px;
  }
  
  .general-v {
    width: 50px;
    height: 100px;
  }
  
  .general-h {
    width: 100px;
    height: 50px;
  }
  
  .soldier {
    width: 50px;
    height: 50px;
  }
  
  .game-info {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .cell {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .caocao {
    width: 80px;
    height: 80px;
  }
  
  .general-v {
    width: 40px;
    height: 80px;
  }
  
  .general-h {
    width: 80px;
    height: 40px;
  }
  
  .soldier {
    width: 40px;
    height: 40px;
  }
  
  .container {
    padding: 10px;
  }
  
  .moves {
    font-size: 16px;
  }
}
</style>