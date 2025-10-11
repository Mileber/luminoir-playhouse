<template>
  <div class="sudoku-game">
    <div class="container">
      <h1>数独游戏</h1>
      <div class="game-info">
        <div class="difficulty-selector">
          <label>难度:</label>
          <select v-model="selectedDifficulty" @change="newGame">
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div class="controls">
          <button @click="checkSolution" class="check-btn">检查答案</button>
          <button @click="newGame" class="new-game-btn">新游戏</button>
          <button @click="resetBoard" class="reset-btn">重置</button>
        </div>
      </div>
      
      <div v-if="loading" class="loading">
        正在生成新的题目，请稍候...
      </div>
      
      <div v-else class="sudoku-board">
        <div 
          v-for="(row, rowIndex) in board" 
          :key="rowIndex"
          class="sudoku-row"
          :class="{ 'thick-bottom': (rowIndex + 1) % 3 === 0 && rowIndex !== 8 }"
        >
          <div 
            v-for="(cell, colIndex) in row" 
            :key="colIndex"
            class="sudoku-cell"
            :class="{
              'fixed': puzzle[rowIndex]?.[colIndex] !== 0,
              'user-input': puzzle[rowIndex]?.[colIndex] === 0,
              'selected': isSelected(rowIndex, colIndex),
              'thick-right': (colIndex + 1) % 3 === 0 && colIndex !== 8,
              'error': errors[rowIndex]?.[colIndex]
            }"
            @click="selectCell(rowIndex, colIndex)"
          >
            {{ cell !== 0 ? cell : '' }}
          </div>
        </div>
      </div>
      
      <div v-if="!loading" class="number-input">
        <div class="number-row">
          <button 
            v-for="num in 9" 
            :key="num" 
            @click="inputNumber(num)"
            class="number-btn"
          >
            {{ num }}
          </button>
          <button @click="clearCell" class="clear-btn">清除</button>
        </div>
      </div>
      
      <div v-if="completed" class="message success">
        恭喜！你完成了数独游戏！
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { SudokuPuzzleBank } from './SudokuGenerator'

// 定义组件名称
defineOptions({
  name: 'SudokuGame'
})

// 游戏状态
const selectedDifficulty = ref<'easy' | 'medium' | 'hard'>('easy')
const puzzle = ref<number[][]>([])
const board = ref<number[][]>([])
const solution = ref<number[][]>([])
const errors = ref<boolean[][]>([])
const selectedCell = reactive({ row: -1, col: -1 })
const completed = ref(false)
const loading = ref(true)

// 数独题目库
const puzzleBank = new SudokuPuzzleBank(5) // 每种难度预生成5个题目

// 初始化错误标记数组
const initErrors = () => {
  errors.value = Array(9).fill(null).map(() => Array(9).fill(false))
}

// 检查是否选中某个单元格
const isSelected = (row: number, col: number) => {
  return selectedCell.row === row && selectedCell.col === col
}

// 选择单元格
const selectCell = (row: number, col: number) => {
  // 只能选择非固定数字的单元格
  if (puzzle.value[row]?.[col] === 0) {
    selectedCell.row = row
    selectedCell.col = col
  }
}

// 输入数字
const inputNumber = (num: number) => {
  // 确保有选中的单元格
  if (selectedCell.row === -1 || selectedCell.col === -1) return
  
  const row = selectedCell.row
  const col = selectedCell.col
  
  // 只能修改非固定数字的单元格
  if (puzzle.value[row]?.[col] === 0) {
    if (board.value[row]) {
      board.value[row][col] = num
    }
    if (errors.value[row]) {
      errors.value[row][col] = false
    }
    checkCompletion()
  }
}

// 清除单元格
const clearCell = () => {
  // 确保有选中的单元格
  if (selectedCell.row === -1 || selectedCell.col === -1) return
  
  const row = selectedCell.row
  const col = selectedCell.col
  
  // 只能清除非固定数字的单元格
  if (puzzle.value[row]?.[col] === 0) {
    if (board.value[row]) {
      board.value[row][col] = 0
    }
    if (errors.value[row]) {
      errors.value[row][col] = false
    }
  }
}

// 检查答案是否正确
const checkSolution = () => {
  resetErrors()
  
  let hasErrors = false
  
  // 检查每一行
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cellValue = board.value[row]?.[col];
      if (cellValue !== undefined && cellValue !== 0 && !isValidPlacement(board.value, row, col, cellValue)) {
        if (errors.value[row]?.[col] !== undefined) {
          errors.value[row]![col] = true
        }
        hasErrors = true
      }
    }
  }
  
  // 检查每一列
  for (let col = 0; col < 9; col++) {
    for (let row = 0; row < 9; row++) {
      const cellValue = board.value[row]?.[col];
      if (cellValue !== undefined && cellValue !== 0 && !isValidPlacement(board.value, row, col, cellValue)) {
        if (errors.value[row]?.[col] !== undefined) {
          errors.value[row]![col] = true
        }
        hasErrors = true
      }
    }
  }
  
  // 检查每个3x3子网格
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const startRow = boxRow * 3
      const startCol = boxCol * 3
      for (let row = startRow; row < startRow + 3; row++) {
        for (let col = startCol; col < startCol + 3; col++) {
          const cellValue = board.value[row]?.[col];
          if (cellValue !== undefined && cellValue !== 0 && !isValidPlacement(board.value, row, col, cellValue)) {
            if (errors.value[row]?.[col] !== undefined) {
              errors.value[row]![col] = true
            }
            hasErrors = true
          }
        }
      }
    }
  }
  
  if (!hasErrors) {
    alert('所有数字都正确放置！')
  } else {
    alert('发现错误，请检查标红的数字。')
  }
}

// 重置错误标记
const resetErrors = () => {
  for (let row = 0; row < 9; row++) {
    if (errors.value[row]) {
      for (let col = 0; col < 9; col++) {
        if (errors.value[row]?.[col] !== undefined) {
          errors.value[row]![col] = false
        }
      }
    }
  }
}

// 检查是否完成游戏
const checkCompletion = () => {
  // 检查是否所有单元格都已填满且没有错误
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cellValue = board.value[row]?.[col];
      if (cellValue === undefined || cellValue === 0) {
        completed.value = false
        return
      }
      
      if (!isValidPlacement(board.value, row, col, cellValue)) {
        completed.value = false
        return
      }
    }
  }
  
  completed.value = true
}

// 验证数字放置是否有效
const isValidPlacement = (board: number[][], row: number, col: number, num: number): boolean => {
  // 检查行
  for (let i = 0; i < 9; i++) {
    const cellValue = board[row]?.[i];
    if (i !== col && cellValue !== undefined && cellValue === num) {
      return false
    }
  }
  
  // 检查列
  for (let i = 0; i < 9; i++) {
    const cellValue = board[i]?.[col];
    if (i !== row && cellValue !== undefined && cellValue === num) {
      return false
    }
  }
  
  // 检查3x3子网格
  const startRow = Math.floor(row / 3) * 3
  const startCol = Math.floor(col / 3) * 3
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const currentRow = startRow + i
      const currentCol = startCol + j
      const cellValue = board[currentRow]?.[currentCol];
      if (currentRow !== row && currentCol !== col && cellValue !== undefined && cellValue === num) {
        return false
      }
    }
  }
  
  return true
}

// 重置游戏板
const resetBoard = () => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle.value[row]?.[col] === 0) {
        if (board.value[row]?.[col] !== undefined) {
          board.value[row]![col] = 0
        }
      }
    }
  }
  resetErrors()
  completed.value = false
  selectedCell.row = -1
  selectedCell.col = -1
}

// 开始新游戏
const newGame = () => {
  loading.value = true
  
  // 在下一个事件循环中执行，确保loading状态先更新
  setTimeout(() => {
    try {
      // 从预生成的题目库中获取随机题目
      const newPuzzle = puzzleBank.getRandomPuzzle(selectedDifficulty.value)
      
      // 初始化游戏板
      puzzle.value = JSON.parse(JSON.stringify(newPuzzle))
      board.value = JSON.parse(JSON.stringify(newPuzzle))
      solution.value = JSON.parse(JSON.stringify(newPuzzle)) // 简化处理，实际应该有完整解
      
      // 初始化错误标记
      initErrors()
      
      // 重置状态
      completed.value = false
      selectedCell.row = -1
      selectedCell.col = -1
    } catch (error) {
      console.error('获取新题目时出错:', error)
      alert('生成新题目时出错，请重试')
    } finally {
      loading.value = false
    }
  }, 0)
}

// 预生成题目
const preGeneratePuzzles = () => {
  loading.value = true
  console.log('开始预生成题目...')
  
  setTimeout(() => {
    try {
      puzzleBank.preGeneratePuzzles()
      console.log('题目预生成状态:', puzzleBank.getPuzzleBankStatus())
      loading.value = false
      // 开始第一个游戏
      newGame()
    } catch (error) {
      console.error('预生成题目时出错:', error)
      loading.value = false
      alert('预生成题目时出错，请重试')
    }
  }, 0)
}

// 组件挂载时初始化游戏
onMounted(() => {
  preGeneratePuzzles()
})

// 组件卸载前清理
onUnmounted(() => {
  // 清理工作（如果需要）
})
</script>

<style scoped>
.sudoku-game {
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

.difficulty-selector label {
  margin-right: 10px;
  font-weight: bold;
}

.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.check-btn {
  background-color: #4CAF50;
  color: white;
}

.new-game-btn {
  background-color: #2196F3;
  color: white;
}

.reset-btn {
  background-color: #f44336;
  color: white;
}

.sudoku-board {
  display: inline-block;
  border: 2px solid #000;
  margin-bottom: 20px;
}

.sudoku-row {
  display: flex;
}

.sudoku-row.thick-bottom {
  border-bottom: 2px solid #000;
}

.sudoku-cell {
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.sudoku-cell.thick-right {
  border-right: 2px solid #000;
}

.sudoku-cell.fixed {
  background-color: #f0f0f0;
  color: #333;
}

.sudoku-cell.user-input {
  background-color: #fff;
  color: #2196F3;
}

.sudoku-cell.selected {
  background-color: #e3f2fd;
}

.sudoku-cell.error {
  background-color: #ffcdd2;
  color: #f44336;
}

.number-input {
  margin-bottom: 20px;
}

.number-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.number-btn, .clear-btn {
  flex: 1;
  min-width: 40px;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.clear-btn {
  background-color: #f44336;
}

.message {
  padding: 15px;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
  font-size: 18px;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: #666;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sudoku-cell {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
  
  .number-btn, .clear-btn {
    min-width: 30px;
    padding: 8px;
    font-size: 14px;
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
  .sudoku-cell {
    width: 25px;
    height: 25px;
    font-size: 14px;
  }
  
  .container {
    padding: 10px;
  }
}
</style>