<template>
  <div class="spider-solitaire">
    <h1>蜘蛛纸牌</h1>
    
    <div class="game-info">
      <div>剩余牌堆: {{ remainingStockDeals }}</div>
      <div>完成: {{ completedPiles }}/8</div>
      <button @click="newGame">新游戏</button>
    </div>
    
    <div class="game-area">
      <!-- 备用牌堆 -->
      <div class="stock-area">
        <div 
          class="stock-pile" 
          @click="dealCards"
          :class="{ 'disabled': remainingStockDeals === 0 }"
        >
          <div v-if="remainingStockDeals > 0" class="card back"></div>
          <div v-if="remainingStockDeals > 1" class="card back offset-1"></div>
          <div v-if="remainingStockDeals > 2" class="card back offset-2"></div>
        </div>
      </div>
      
      <!-- 完成牌堆区域 -->
      <div class="foundation-area">
        <div 
          v-for="n in completedPiles" 
          :key="n" 
          class="completed-pile"
        >
          <div class="card back completed"></div>
        </div>
      </div>
    </div>
    
    <!-- 游戏列区域 -->
    <div class="tableau">
      <div 
        v-for="(column, colIndex) in tableau" 
        :key="colIndex" 
        class="tableau-column"
        @drop="onDrop(colIndex, $event)"
        @dragover.prevent
      >
        <div 
          v-for="(card, cardIndex) in column" 
          :key="`${colIndex}-${cardIndex}`"
          :class="['card', { 'back': !card.faceUp, 'selected': selectedCard && selectedCard.colIndex === colIndex && selectedCard.cardIndex === cardIndex }]"
          :data-col="colIndex"
          :data-index="cardIndex"
          :draggable="card.faceUp"
          @dragstart="onDragStart(colIndex, cardIndex, $event)"
          @click="onCardClick(colIndex, cardIndex)"
        >
          <div v-if="card.faceUp" class="card-face">
            <span class="card-value" :class="getSuitClass(card.suit)">{{ getCardValue(card.value) }}</span>
            <span class="card-suit" :class="getSuitClass(card.suit)">{{ getSuitSymbol(card.suit) }}</span>
          </div>
        </div>
        
        <!-- 空列占位符 -->
        <div v-if="column.length === 0" class="empty-slot" @drop="onDrop(colIndex, $event)" @dragover.prevent></div>
      </div>
    </div>
    
    <!-- 胜利提示 -->
    <div v-if="gameWon" class="win-overlay">
      <div class="win-message">
        <h2>恭喜获胜!</h2>
        <button @click="newGame">再玩一局</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 定义花色枚举
enum Suit {
  SPADES = 'spades',     // 黑桃
  HEARTS = 'hearts',     // 红桃
  DIAMONDS = 'diamonds', // 方块
  CLUBS = 'clubs'        // 梅花
}

// 定义牌面值枚举
enum CardValue {
  ACE = 1,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  TEN,
  JACK,
  QUEEN,
  KING
}

// 定义卡牌接口
interface Card {
  suit: Suit
  value: CardValue
  faceUp: boolean
}

// 定义列类型
type Column = Card[]

// 游戏状态
const tableau = ref<Column[]>(Array(10).fill(null).map(() => []))
const stock = ref<Card[]>([])
const remainingStockDeals = ref(5) // 剩余发牌次数
const completedPiles = ref(0) // 已完成的牌堆数
const gameWon = ref(false)

// 移动端选中状态
const selectedCard = ref<{
  colIndex: number
  cardIndex: number
} | null>(null)

// 拖拽状态
const dragState = ref({
  fromColumn: -1,
  fromIndex: -1
})

// 创建一副牌
const createDeck = (): Card[] => {
  const deck: Card[] = []
  
  // 蜘蛛纸牌使用两副牌
  for (let i = 0; i < 2; i++) {
    for (const suit of Object.values(Suit)) {
      for (let value = CardValue.ACE; value <= CardValue.KING; value++) {
        deck.push({
          suit,
          value,
          faceUp: false
        })
      }
    }
  }
  
  return deck
}

// 洗牌
const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // 使用类型断言确保元素存在
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

// 初始化游戏
const initGame = () => {
  // 重置游戏状态
  tableau.value = Array(10).fill(null).map(() => [])
  stock.value = []
  remainingStockDeals.value = 5
  completedPiles.value = 0
  gameWon.value = false
  
  // 创建并洗牌
  let deck = createDeck()
  deck = shuffleDeck(deck)
  
  // 发牌到10列
  // 前4列每列6张牌，后6列每列5张牌
  for (let col = 0; col < 10; col++) {
    const cardsInColumn = col < 4 ? 6 : 5
    for (let row = 0; row < cardsInColumn; row++) {
      const card = deck.pop()!
      // 只有最上面的牌是正面朝上的
      card.faceUp = (row === cardsInColumn - 1)
      if (tableau.value[col]) {
        tableau.value[col]!.push(card)
      }
    }
  }
  
  // 剩余的50张牌放入备用牌堆
  stock.value = deck
}

// 发牌
const dealCards = () => {
  if (remainingStockDeals.value <= 0 || stock.value.length === 0) {
    return
  }
  
  // 每列发一张牌
  for (let col = 0; col < 10; col++) {
    if (stock.value.length > 0 && tableau.value[col]) {
      const card = stock.value.pop()!
      card.faceUp = true
      tableau.value[col]!.push(card)
    }
  }
  
  remainingStockDeals.value--
  
  // 检查是否有可以自动完成的牌组
  checkForCompletedSequences()
}

// 获取卡牌显示值
const getCardValue = (value: CardValue): string => {
  switch (value) {
    case CardValue.ACE: return 'A'
    case CardValue.JACK: return 'J'
    case CardValue.QUEEN: return 'Q'
    case CardValue.KING: return 'K'
    default: return value.toString()
  }
}

// 获取花色CSS类
const getSuitClass = (suit: Suit): string => {
  switch (suit) {
    case Suit.HEARTS:
    case Suit.DIAMONDS:
      return 'card-red'
    case Suit.SPADES:
    case Suit.CLUBS:
      return 'card-black'
    default:
      return ''
  }
}

// 获取花色符号
const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case Suit.HEARTS:
      return '♥'
    case Suit.DIAMONDS:
      return '♦'
    case Suit.SPADES:
      return '♠'
    case Suit.CLUBS:
      return '♣'
    default:
      return ''
  }
}

// 拖拽开始
const onDragStart = (colIndex: number, cardIndex: number, event: DragEvent) => {
  // 只能拖拽正面朝上的牌
  const card = tableau.value[colIndex]?.[cardIndex]
  if (!card || !card.faceUp) {
    event.preventDefault()
    return
  }
  
  // 检查从这张牌开始是否可以移动整组牌
  if (!canMoveSequence(colIndex, cardIndex)) {
    event.preventDefault()
    return
  }
  
  dragState.value = {
    fromColumn: colIndex,
    fromIndex: cardIndex
  }
  
  // 设置拖拽数据
  event.dataTransfer?.setData('text/plain', `${colIndex},${cardIndex}`)
  event.dataTransfer!.effectAllowed = 'move'
}

// 检查是否可以移动从指定位置开始的牌序列
const canMoveSequence = (colIndex: number, startIndex: number): boolean => {
  const column = tableau.value[colIndex]
  if (!column) return false
  
  // 检查序列是否按降序排列
  for (let i = startIndex; i < column.length - 1; i++) {
    const card1 = column[i]
    const card2 = column[i + 1]
    
    // 当前牌应该比下一张牌大1
    if (card1 && card2 && card1.value !== card2.value + 1) {
      return false
    }
    
    // 牌必须是正面朝上的
    if (card2 && !card2.faceUp) {
      return false
    }
  }
  
  return true
}

// 拖拽放置
const onDrop = (colIndex: number, event: DragEvent) => {
  event.preventDefault()
  
  const fromCol = dragState.value.fromColumn
  const fromIndex = dragState.value.fromIndex
  
  if (fromCol === -1 || fromIndex === -1) {
    return
  }
  
  moveCards(fromCol, fromIndex, colIndex)
}

// 移动牌组
const moveCards = (fromCol: number, fromIndex: number, toCol: number) => {
  // 不能移动到同一列
  if (fromCol === toCol) {
    return
  }
  
  const fromColumn = tableau.value[fromCol]
  const toColumn = tableau.value[toCol]
  
  if (!fromColumn || !toColumn) {
    return
  }
  
  // 检查移动是否合法
  if (!isValidMove(fromCol, fromIndex, toCol)) {
    return
  }
  
  // 移动牌组
  const cardsToMove = fromColumn.splice(fromIndex)
  tableau.value[toCol] = [...toColumn, ...cardsToMove]
  
  // 翻开新牌
  if (fromColumn.length > 0) {
    const lastCard = fromColumn[fromColumn.length - 1]
    if (lastCard && !lastCard.faceUp) {
      lastCard.faceUp = true
    }
  }
  
  // 检查是否有可以自动完成的牌组
  checkForCompletedSequences()
  
  // 检查游戏是否胜利
  checkWinCondition()
}

// 检查移动是否合法
const isValidMove = (fromCol: number, fromIndex: number, toCol: number): boolean => {
  const fromColumn = tableau.value[fromCol]
  const toColumn = tableau.value[toCol]
  
  if (!fromColumn || !toColumn) {
    return false
  }
  
  // 检查源列是否有牌
  if (fromIndex >= fromColumn.length) {
    return false
  }
  
  const movingCard = fromColumn[fromIndex]
  if (!movingCard) {
    return false
  }
  
  // 如果目标列为空，可以放置任何牌
  if (toColumn.length === 0) {
    return true
  }
  
  const targetCard = toColumn[toColumn.length - 1]
  if (!targetCard) {
    return false
  }
  
  // 目标牌必须是正面朝上的
  if (!targetCard.faceUp) {
    return false
  }
  
  // 移动的牌必须比目标牌小1
  return movingCard.value === targetCard.value - 1
}

// 检查是否有可以自动完成的牌组
const checkForCompletedSequences = () => {
  for (let colIndex = 0; colIndex < tableau.value.length; colIndex++) {
    const column = tableau.value[colIndex]
    
    if (!column) continue
    
    // 检查是否有完整的K到A序列（同一花色）
    if (column.length >= 13) {
      let isCompleteSequence = true
      let suit: Suit | null = null
      
      // 检查最后13张牌是否是K到A的序列
      for (let i = 0; i < 13; i++) {
        const cardIndex = column.length - 13 + i
        const card = column[cardIndex]
        
        if (!card) {
          isCompleteSequence = false
          break
        }
        
        // 必须是正面朝上的牌
        if (!card.faceUp) {
          isCompleteSequence = false
          break
        }
        
        // 检查数值是否正确（K到A）
        if (card.value !== CardValue.KING - i) {
          isCompleteSequence = false
          break
        }
        
        // 检查花色是否一致
        if (suit === null) {
          suit = card.suit
        } else if (card.suit !== suit) {
          isCompleteSequence = false
          break
        }
      }
      
      // 如果是完整序列，移除它
      if (isCompleteSequence) {
        column.splice(column.length - 13, 13)
        completedPiles.value++
        
        // 翻开新牌
        if (column.length > 0) {
          const lastCard = column[column.length - 1]
          if (lastCard && !lastCard.faceUp) {
            lastCard.faceUp = true
          }
        }
        
        // 递归检查是否还有其他完成的序列
        checkForCompletedSequences()
        return
      }
    }
  }
}

// 检查游戏胜利条件
const checkWinCondition = () => {
  // 完成8个牌堆即获胜
  if (completedPiles.value === 8) {
    gameWon.value = true
  }
}

// 卡牌点击事件（用于移动端）
const onCardClick = (colIndex: number, cardIndex: number) => {
  // 忽略背面朝上的卡牌
  const card = tableau.value[colIndex]?.[cardIndex]
  if (!card || !card.faceUp) {
    // 取消选中
    selectedCard.value = null
    return
  }

  // 如果没有选中任何卡牌，选中当前卡牌
  if (!selectedCard.value) {
    // 检查从这张牌开始是否可以移动整组牌
    if (canMoveSequence(colIndex, cardIndex)) {
      selectedCard.value = { colIndex, cardIndex }
    }
    return
  }

  // 如果点击的是已选中的卡牌，取消选中
  if (selectedCard.value.colIndex === colIndex && selectedCard.value.cardIndex === cardIndex) {
    selectedCard.value = null
    return
  }

  // 如果点击的是同一列中的卡牌，且在选中卡牌的上方，更新选中位置
  if (selectedCard.value.colIndex === colIndex && cardIndex > selectedCard.value.cardIndex) {
    // 检查从新位置开始是否可以移动整组牌
    if (canMoveSequence(colIndex, cardIndex)) {
      selectedCard.value = { colIndex, cardIndex }
    }
    return
  }

  // 尝试移动选中的卡牌到目标位置
  const targetColumn = tableau.value[colIndex]
  if (targetColumn && isValidMove(selectedCard.value.colIndex, selectedCard.value.cardIndex, colIndex)) {
    moveCards(selectedCard.value.colIndex, selectedCard.value.cardIndex, colIndex)
    selectedCard.value = null
  } else {
    // 如果不能移动到目标位置，取消选中
    selectedCard.value = null
  }
}

// 新游戏
const newGame = () => {
  initGame()
}

// 初始化游戏
onMounted(() => {
  initGame()
})
</script>

<style scoped>
.spider-solitaire {
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
  max-width: 800px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
}

.game-info button {
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.game-info button:hover {
  background-color: #e0e0e0;
}

.game-area {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
}

.stock-area {
  display: flex;
  align-items: center;
}

.stock-pile {
  position: relative;
  width: 80px;
  height: 110px;
  cursor: pointer;
}

.stock-pile.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.foundation-area {
  display: flex;
  gap: 10px;
}

.completed-pile {
  width: 80px;
  height: 110px;
  border: 2px dashed #ccc;
  border-radius: 8px;
}

.tableau {
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 1000px;
  margin-top: 20px;
}

.tableau-column {
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card {
  width: 80px;
  height: 110px;
  border: 1px solid #333;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -80px;
  background-color: white;
  position: relative;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.card.back {
  background: linear-gradient(135deg, #0062ff, #00a8ff);
  cursor: pointer;
}

.card.selected {
  box-shadow: 0 0 0 2px #4caf50, 0 0 10px #4caf50;
  transform: translateY(-10px);
}

.card.back::before {
  content: "♠";
  color: white;
  font-size: 24px;
}

.card .card-face {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
  box-sizing: border-box;
  font-weight: bold;
  font-size: 18px;
}

.card .card-face span {
  text-align: center;
}

.card-value {
  align-self: flex-start;
}

.card-suit {
  font-size: 24px;
  align-self: flex-end;
}

.card-red {
  color: #e74c3c;
}

.card-black {
  color: #2c3e50;
}

.empty-slot {
  width: 80px;
  height: 110px;
  border: 2px dashed #ccc;
  border-radius: 6px;
  margin-bottom: 20px;
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

.offset-1 {
  position: absolute;
  top: 2px;
  left: 2px;
}

.offset-2 {
  position: absolute;
  top: 4px;
  left: 4px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .tableau {
    flex-wrap: wrap;
  }
  
  .tableau-column {
    min-width: calc(25% - 10px);
    margin-bottom: 20px;
  }
  
  .card {
    width: 60px;
    height: 85px;
    margin-bottom: -60px;
  }
  
  .empty-slot {
    width: 60px;
    height: 85px;
  }
  
  .stock-pile {
    width: 60px;
    height: 85px;
  }
  
  .completed-pile {
    width: 60px;
    height: 85px;
  }
  
  .game-info {
    font-size: 16px;
  }
  
  .card .card-face {
    font-size: 14px;
  }
}
</style>