<template>
  <div class="gomoku-game">
    <h1>五子棋</h1>
    <div class="game-container">
      <canvas 
        ref="gomokuCanvas" 
        width="400" 
        height="400" 
        @click="handleClick"
      ></canvas>
      <div class="game-info">
        <p>{{ gameInfo }}</p>
        <button v-if="gameOver" @click="resetGame">重新开始</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

// 定义组件名称，符合ESLint规则
defineOptions({
  name: 'GomokuGame'
});

// 棋盘大小 (15x15)
const BOARD_SIZE = 15;
const CELL_SIZE = 400 / BOARD_SIZE;

// 游戏状态
const board = ref<number[][]>(Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0)));
const currentPlayer = ref<number>(1); // 1: 黑棋, 2: 白棋
const gameOver = ref<boolean>(false);
const winner = ref<number>(0);
const gomokuCanvas = ref<HTMLCanvasElement | null>(null);

// 游戏信息文本
const gameInfo = computed(() => {
  if (gameOver.value) {
    return winner.value === 1 ? '黑棋获胜！' : '白棋获胜！';
  } else {
    return currentPlayer.value === 1 ? '当前回合: 黑棋' : '当前回合: 白棋';
  }
});

// 初始化游戏
const initGame = () => {
  board.value = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
  currentPlayer.value = 1;
  gameOver.value = false;
  winner.value = 0;
  drawBoard();
};

// 重置游戏
const resetGame = () => {
  initGame();
};

// 绘制棋盘
const drawBoard = () => {
  const canvas = gomokuCanvas.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // 绘制棋盘背景
  ctx.fillStyle = '#f3d2b5';
  ctx.fillRect(0, 0, 400, 400);
  
  // 绘制棋盘网格
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  
  // 绘制横线
  for (let i = 0; i < BOARD_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(CELL_SIZE / 2, CELL_SIZE / 2 + i * CELL_SIZE);
    ctx.lineTo(400 - CELL_SIZE / 2, CELL_SIZE / 2 + i * CELL_SIZE);
    ctx.stroke();
  }
  
  // 绘制竖线
  for (let i = 0; i < BOARD_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(CELL_SIZE / 2 + i * CELL_SIZE, CELL_SIZE / 2);
    ctx.lineTo(CELL_SIZE / 2 + i * CELL_SIZE, 400 - CELL_SIZE / 2);
    ctx.stroke();
  }
  
  // 绘制棋子
   for (let i = 0; i < BOARD_SIZE; i++) {
     for (let j = 0; j < BOARD_SIZE; j++) {
      if (board.value[i] && board.value[i]?.[j] !== 0) {
        const x = CELL_SIZE / 2 + j * CELL_SIZE;
        const y = CELL_SIZE / 2 + i * CELL_SIZE;
        
        ctx.beginPath();
        ctx.arc(x, y, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
        
        if (board.value[i] && board.value[i]?.[j] === 1) {
          // 黑棋
          ctx.fillStyle = '#000';
        } else {
          // 白棋
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        
        ctx.fill();
      }
    }
  }
};

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (gameOver.value) return;
  
  const canvas = gomokuCanvas.value;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // 计算棋盘坐标，并确保落在交叉点上
  const col = Math.round((x - CELL_SIZE / 2) / CELL_SIZE);
  const row = Math.round((y - CELL_SIZE / 2) / CELL_SIZE);
  
  // 检查坐标是否有效
  if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
    // 检查该位置是否已有棋子
    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && board.value[row]?.[col] === 0) {
      // 放置棋子
      if (board.value[row]) {
        board.value[row][col] = currentPlayer.value;
      }
      
      // 检查是否获胜
      if (checkWin(row, col)) {
        gameOver.value = true;
        winner.value = currentPlayer.value;
      } else {
        // 切换玩家
        currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
      }
      
      // 重绘棋盘
      drawBoard();
    }
  }
};

// 检查是否获胜
const checkWin = (row: number, col: number): boolean => {
  const directions = [
    [0, 1],   // 水平
    [1, 0],   // 垂直
    [1, 1],   // 对角线
    [1, -1]   // 反对角线
  ];
  
  // 确保坐标有效
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return false;
  }
  
  const player = board.value[row]?.[col];
  
  for (const direction of directions) {
    // 使用非空断言，因为我们确定direction是一个包含两个元素的数组
    const dx = direction[0]!;
    const dy = direction[1]!;
    let count = 1;
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;
      
      if (
        newRow >= 0 && newRow < BOARD_SIZE &&
        newCol >= 0 && newCol < BOARD_SIZE &&
        board.value[newRow] && board.value[newRow][newCol] === player
      ) {
        count++;
      } else {
        break;
      }
    }
    
    // 反向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row - i * dx;
      const newCol = col - i * dy;
      
      if (
        newRow >= 0 && newRow < BOARD_SIZE &&
        newCol >= 0 && newCol < BOARD_SIZE &&
        board.value[newRow] && board.value[newRow][newCol] === player
      ) {
        count++;
      } else {
        break;
      }
    }
    
    // 如果连成5个，则获胜
    if (count >= 5) {
      return true;
    }
  }
  
  return false;
};

// 组件挂载时初始化游戏
onMounted(() => {
  initGame();
});
</script>

<style scoped>
.gomoku-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f0f0f0;
  min-height: 100vh;
  box-sizing: border-box;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

canvas {
  background-color: #f3d2b5;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.game-info {
  margin-top: 20px;
  text-align: center;
}

.game-info p {
  font-size: 20px;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}
</style>