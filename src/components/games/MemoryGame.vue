<template>
  <div class="memory-game">
    <div class="container">
      <h1>翻翻乐</h1>
      <div class="game-info">
        <div class="moves">步数: {{ moves }}</div>
        <div class="pairs">配对: {{ matchedPairs }}/{{ totalPairs }}</div>
        <div class="controls">
          <button @click="initGame" class="restart-btn">重新开始</button>
        </div>
      </div>
      
      <div class="game-board">
        <div 
          v-for="(row, rowIndex) in board" 
          :key="rowIndex"
          class="board-row"
        >
          <div 
            v-for="(card, colIndex) in row" 
            :key="colIndex"
            class="card"
            :class="{ 
              'flipped': card.isFlipped,
              'matched': card.isMatched
            }"
            @click="flipCard(rowIndex, colIndex)"
          >
            <div class="card-face card-front"></div>
            <div class="card-face card-back">
              <span class="emoji">{{ card.emoji }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="gameCompleted" class="game-completed">
        <h2>恭喜你完成了游戏！</h2>
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
  name: 'MemoryGame'
})

// 游戏常量
const BOARD_SIZE = 4
const EMOJIS: string[] = ['😀', '😂', '🥰', '😎', '🤩', '🥳', '😍', '🤗']

// 卡片接口
interface Card {
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

// 游戏状态
const board = reactive<Card[][]>([])
const moves = ref(0)
const matchedPairs = ref(0)
const totalPairs = ref(0)
const gameCompleted = ref(false)
const firstCard = ref<{ row: number; col: number } | null>(null)
const secondCard = ref<{ row: number; col: number } | null>(null)
const lockBoard = ref(false)

// 初始化游戏
const initGame = () => {
  // 重置游戏状态
  moves.value = 0
  matchedPairs.value = 0
  gameCompleted.value = false
  firstCard.value = null
  secondCard.value = null
  lockBoard.value = false
  
  // 清空游戏板
  board.length = 0
  
  // 计算配对数量
  totalPairs.value = (BOARD_SIZE * BOARD_SIZE) / 2
  
  // 创建卡片数组
  const emojis: string[] = []
  
  // 选择需要的emoji数量
  for (let i = 0; i < totalPairs.value; i++) {
    // 确保EMOJIS[i]存在
    if (EMOJIS[i] !== undefined) {
      // @ts-expect-error 确保EMOJIS[i]存在
      emojis.push(EMOJIS[i])
      // @ts-expect-error 确保EMOJIS[i]存在
      emojis.push(EMOJIS[i])
    }
  }
  
  // 随机打乱emoji数组
  shuffleArray(emojis)
  
  // 创建游戏板
  let emojiIndex = 0
  for (let row = 0; row < BOARD_SIZE; row++) {
    const rowCards: Card[] = []
    for (let col = 0; col < BOARD_SIZE; col++) {
      // 确保emojis[emojiIndex]存在
      if (emojis[emojiIndex] !== undefined) {
        rowCards.push({
          emoji: emojis[emojiIndex]!,
          isFlipped: false,
          isMatched: false
        })
      }
      emojiIndex++
    }
    board.push(rowCards)
  }
}

// 随机打乱数组
const shuffleArray = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // 使用非空断言，因为前面已经检查了undefined
    if (array[i] !== undefined && array[j] !== undefined) {
      [array[i], array[j]] = [array[j]!, array[i]!]
    }
  }
}

// 翻牌
const flipCard = (row: number, col: number) => {
  // 如果游戏锁定、卡片已翻开或已配对，则不处理
  const card = board[row]?.[col]
  if (lockBoard.value || !card || card.isFlipped || card.isMatched) {
    return
  }
  
  // 翻开卡片
  if (card) {
    card.isFlipped = true
  }
  
  // 如果这是第一张翻开的卡片
  if (!firstCard.value) {
    firstCard.value = { row, col }
    return
  }
  
  // 这是第二张翻开的卡片
  secondCard.value = { row, col }
  
  // 增加步数
  moves.value++
  
  // 检查是否匹配
  checkForMatch()
}

// 检查是否匹配
const checkForMatch = () => {
  if (!firstCard.value || !secondCard.value) return
  
  // @ts-expect-error 确保访问是安全的
  const firstCardObj = board[firstCard.value.row][firstCard.value.col]
  // @ts-expect-error 确保访问是安全的
  const secondCardObj = board[secondCard.value.row][secondCard.value.col]
  
  // @ts-expect-error 确保firstCardObj和secondCardObj存在
  const isMatch = firstCardObj.emoji === secondCardObj.emoji
  
  if (isMatch) {
    // 匹配成功
    // @ts-expect-error 确保firstCardObj和secondCardObj存在
    firstCardObj.isMatched = true
    // @ts-expect-error 确保firstCardObj和secondCardObj存在
    secondCardObj.isMatched = true
    matchedPairs.value++
    
    // 重置选择
    resetSelection()
    
    // 检查游戏是否完成
    checkGameCompletion()
  } else {
    // 不匹配，翻回卡片
    lockBoard.value = true
    setTimeout(() => {
      // @ts-expect-error 确保firstCardObj和secondCardObj存在
      firstCardObj.isFlipped = false
      // @ts-expect-error 确保firstCardObj和secondCardObj存在
      secondCardObj.isFlipped = false
      resetSelection()
      lockBoard.value = false
    }, 1000)
  }
}

// 重置选择
const resetSelection = () => {
  firstCard.value = null
  secondCard.value = null
}

// 检查游戏是否完成
const checkGameCompletion = () => {
  if (matchedPairs.value === totalPairs.value) {
    gameCompleted.value = true
  }
}

// 组件挂载时初始化游戏
onMounted(() => {
  initGame()
})
</script>

<style scoped>
.memory-game {
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

.moves, .pairs {
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
  margin-bottom: 20px;
}

.board-row {
  display: flex;
}

.card {
  width: 70px;
  height: 70px;
  position: relative;
  margin: 5px;
  transform-style: preserve-3d;
  transition: transform 0.3s;
  cursor: pointer;
}

.card.flipped, .card.matched {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 30px;
}

.card-front {
  background-color: #2196F3;
  border: 2px solid #1976D2;
}

.card-back {
  background-color: #fff;
  border: 2px solid #ccc;
  transform: rotateY(180deg);
}

.card.matched .card-back {
  background-color: #c8e6c9;
  border-color: #4caf50;
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
  .card {
    width: 60px;
    height: 60px;
    font-size: 24px;
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
  .card {
    width: 50px;
    height: 50px;
    font-size: 20px;
    margin: 3px;
  }
  
  .container {
    padding: 10px;
  }
  
  .moves, .pairs {
    font-size: 16px;
  }
}
</style>