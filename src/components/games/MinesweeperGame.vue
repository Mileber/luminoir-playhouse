<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';

// --- 游戏配置 ---
const ROWS = 9;
const COLS = 9;
const MINES = 10;

// --- 类型定义 ---
interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number; // 相邻地雷数
}

// --- 响应式状态 ---
const board = reactive<Cell[][]>([]);
const gameOver = ref(false);
const gameWon = ref(false);
const firstClick = ref(true);

// --- 计算属性 ---
const totalCells = computed(() => ROWS * COLS);
const revealedCount = computed(() => {
  let count = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // 修复：确保board[r][c]存在
      const row = board[r];
      if (row) {
        const cell = row[c];
        if (cell && cell.isRevealed) count++;
      }
    }
  }
  return count;
});

// --- 初始化棋盘 ---
const initializeBoard = () => {
  board.length = 0; // Clear existing board
  for (let r = 0; r < ROWS; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      });
    }
    board.push(row);
  }
  gameOver.value = false;
  gameWon.value = false;
  firstClick.value = true;
};

// --- 放置地雷 ---
const placeMines = (firstClickRow: number, firstClickCol: number) => {
  let minesPlaced = 0;
  while (minesPlaced < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    // 确保第一个点击的格子及其周围不是地雷
    const isFirstClickArea =
      Math.abs(r - firstClickRow) <= 1 && Math.abs(c - firstClickCol) <= 1;
    // 修复：确保board[r][c]存在
    const row = board[r];
    if (row) {
      const cell = row[c];
      if (cell && !cell.isMine && !isFirstClickArea) {
        cell.isMine = true;
        minesPlaced++;
      }
    }
  }
};

// --- 计算相邻地雷数 ---
const calculateNeighborMines = () => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // 修复：确保board[r][c]存在
      const row = board[r];
      if (row) {
        const cell = row[c];
        if (cell && !cell.isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              // 修复：确保board[nr][nc]存在
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                const nRow = board[nr];
                if (nRow) {
                  const nCell = nRow[nc];
                  if (nCell && nCell.isMine) {
                    count++;
                  }
                }
              }
            }
          }
          cell.neighborMines = count;
        }
      }
    }
  }
};

// --- 点击格子 ---
const revealCell = (r: number, c: number) => {
  // 修复：确保board[r][c]存在
  const row = board[r];
  if (!row) return;
  
  const cell = row[c];
  if (!cell) return;
  
  if (gameOver.value || gameWon.value || cell.isRevealed || cell.isFlagged) return;

  if (firstClick.value) {
    placeMines(r, c);
    calculateNeighborMines();
    firstClick.value = false;
  }

  cell.isRevealed = true;

  if (cell.isMine) {
    gameOver.value = true;
    revealAllMines();
    return;
  }

  if (cell.neighborMines === 0) {
    // Auto-reveal neighbors if it's an empty cell
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        // 修复：确保board[nr][nc]存在
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          const nRow = board[nr];
          if (nRow) {
            const nCell = nRow[nc];
            if (nCell && !nCell.isRevealed && !nCell.isFlagged) {
              revealCell(nr, nc); // Recursive reveal
            }
          }
        }
      }
    }
  }

  checkWin();
};

// --- 揭示所有地雷 (游戏结束时) ---
const revealAllMines = () => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // 修复：确保board[r][c]存在
      const row = board[r];
      if (row) {
        const cell = row[c];
        if (cell && cell.isMine) {
          cell.isRevealed = true;
        }
      }
    }
  }
};

// --- 检查是否获胜 ---
const checkWin = () => {
  if (revealedCount.value === totalCells.value - MINES) {
    gameWon.value = true;
    flagAllMines();
  }
};

// --- 标记所有地雷 (获胜时) ---
const flagAllMines = () => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // 修复：确保board[r][c]存在
      const row = board[r];
      if (row) {
        const cell = row[c];
        if (cell && cell.isMine) {
          cell.isFlagged = true;
        }
      }
    }
  }
};

// --- 右键标记/取消标记 ---
const handleRightClick = (event: MouseEvent, r: number, c: number) => {
  event.preventDefault(); // 阻止默认右键菜单
  // 修复：确保board[r][c]存在
  const row = board[r];
  if (!row) return;
  
  const cell = row[c];
  if (!cell) return;
  
  if (gameOver.value || gameWon.value || cell.isRevealed) return;
  cell.isFlagged = !cell.isFlagged;
};

// --- 重置游戏 ---
const resetGame = () => {
  initializeBoard();
};

// --- 生命周期钩子 ---
onMounted(() => {
  initializeBoard();
});
</script>

<template>
  <div class="minesweeper-game">
    <h2>扫雷游戏 🧨</h2>
    <div class="game-info">
      <p>地雷数: {{ MINES }}</p>
      <p v-if="gameOver">游戏结束！踩到地雷了。</p>
      <p v-else-if="gameWon">恭喜你，成功排雷！</p>
      <button @click="resetGame">重新开始</button>
    </div>
    <div class="board" :class="{ 'game-over': gameOver, 'game-won': gameWon }">
      <div v-for="(row, r) in board" :key="r" class="row">
        <div
          v-for="(cell, c) in row"
          :key="c"
          class="cell"
          :class="{
            revealed: cell.isRevealed,
            mine: cell.isMine && cell.isRevealed,
            flagged: cell.isFlagged,
            [`n${cell.neighborMines}`]: cell.isRevealed && !cell.isMine
          }"
          @click="revealCell(r, c)"
          @contextmenu="handleRightClick($event, r, c)"
        >
          <span v-if="cell.isFlagged">🚩</span>
          <span v-else-if="cell.isRevealed && cell.isMine">💣</span>
          <span v-else-if="cell.isRevealed && cell.neighborMines > 0">{{ cell.neighborMines }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.minesweeper-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: fit-content;
  margin: 0 auto;
}

.game-info {
  margin-bottom: 15px;
  text-align: center;
}

.board {
  display: inline-block;
  border: 2px solid #333;
  background-color: #bdbdbd;
}

.row {
  display: flex;
}

.cell {
  width: 30px;
  height: 30px;
  border: 1px solid #9e9e9e;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  user-select: none; /* Prevent text selection */
  background-color: #e0e0e0;
  cursor: pointer;
}

.cell.revealed {
  background-color: #fff;
  border: 1px solid #bdbdbd;
}

.cell.mine {
  background-color: #ff5252; /* Red for revealed mine */
}

.cell.flagged {
  background-color: #4caf50; /* Green for flagged */
}

/* Number colors for revealed cells */
.cell.n1 { color: #2196f3; } /* Blue */
.cell.n2 { color: #4caf50; } /* Green */
.cell.n3 { color: #f44336; } /* Red */
.cell.n4 { color: #9c27b0; } /* Purple */
.cell.n5 { color: #ff9800; } /* Orange */
.cell.n6 { color: #00bcd4; } /* Cyan */
.cell.n7 { color: #000000; } /* Black */
.cell.n8 { color: #795548; } /* Brown */

.game-over .cell:not(.revealed):not(.flagged) {
  background-color: #ffcdd2; /* Light red for unrevealed cells on game over */
}

.game-won .cell.flagged {
  background-color: #a5d6a7; /* Light green for flags on win */
}
</style>
