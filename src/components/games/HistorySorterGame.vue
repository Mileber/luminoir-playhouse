<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';

// --- 类型定义 ---
interface HistoricalEvent {
  id: number;
  year: number;
  description: string;
}

// --- 游戏数据 ---
const historicalEvents: HistoricalEvent[] = [
  { id: 1, year: -221, description: "秦始皇统一六国，建立秦朝" },
  { id: 2, year: 618, description: "唐朝建立" },
  { id: 3, year: 1271, description: "忽必烈建立元朝" },
  { id: 4, year: 1368, description: "明朝建立" },
  { id: 5, year: 1644, description: "清朝建立" },
  { id: 6, year: 1912, description: "中华民国成立" },
  { id: 7, year: 1949, description: "中华人民共和国成立" },
  { id: 8, year: 1978, description: "改革开放开始" },
];

// --- 响应式状态 ---
const events = reactive<HistoricalEvent[]>([]);
const isSorted = ref(false);
const feedback = ref("");

// --- 计算属性 ---
const sortedEvents = computed(() => {
  return [...historicalEvents].sort((a, b) => a.year - b.year);
});

// --- 初始化游戏 ---
const initializeGame = () => {
  // 洗牌算法 (Fisher-Yates Shuffle)
  events.length = 0;
  const shuffled = [...historicalEvents];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // 修复：确保数组元素不为undefined
    const temp = shuffled[i];
    if (temp !== undefined && shuffled[j] !== undefined) {
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }
  }
  events.push(...shuffled);
  isSorted.value = false;
  feedback.value = "";
};

// --- 拖拽相关 ---
const dragItem = ref<number | null>(null);
const touchItem = ref<number | null>(null);

// 处理鼠标拖拽
const handleDragStart = (event: DragEvent, index: number) => {
  dragItem.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    // 在 Firefox 中需要设置 data，否则 drag 事件可能不触发
    event.dataTransfer.setData('text/plain', ''); 
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault(); // 允许放置
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault();
  if (dragItem.value === null || dragItem.value === targetIndex) return;

  // 确保draggedItem存在且索引有效
  const draggedItem = events[dragItem.value!];
  if (draggedItem === undefined) return;
  
  events.splice(dragItem.value!, 1);
  events.splice(targetIndex, 0, draggedItem);
  
  dragItem.value = null; // Reset drag item
};

// 处理触摸拖拽
const handleTouchStart = (event: TouchEvent, index: number) => {
  touchItem.value = index;
  // 防止页面滚动
  event.preventDefault();
};

const handleTouchMove = (event: TouchEvent) => {
  if (touchItem.value === null) return;
  event.preventDefault();
  
  // 获取当前触摸位置下的元素
  const touch = event.touches[0];
  if (!touch) return;
  
  const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
  
  // 查找最近的事件项元素
  const eventItem = element?.closest('.event-item');
  if (!eventItem) return;
  
  // 获取目标索引
  const targetIndex = parseInt(eventItem.getAttribute('data-index') || '-1');
  if (targetIndex === -1 || targetIndex === touchItem.value) return;
  
  // 移动项目
  const touchedItem = events[touchItem.value];
  if (touchedItem === undefined) return;
  
  events.splice(touchItem.value, 1);
  events.splice(targetIndex, 0, touchedItem);
  
  // 更新当前拖动项的索引
  touchItem.value = targetIndex;
};

const handleTouchEnd = () => {
  touchItem.value = null;
};

// --- 检查排序 ---
const checkOrder = () => {
  isSorted.value = true;
  let correct = true;
  for (let i = 0; i < events.length; i++) {
    // 修复：确保数组元素存在
    const event = events[i];
    const sortedEvent = sortedEvents.value[i];
    if (event && sortedEvent && event.id !== sortedEvent.id) {
      correct = false;
      break;
    }
  }
  feedback.value = correct ? "🎉 完全正确！你对历史了如指掌！" : "再检查一下哦，有些事件的顺序不对。";
};

// --- 重置游戏 ---
const resetGame = () => {
  initializeGame();
};

// --- 生命周期钩子 ---
onMounted(() => {
  initializeGame();
});
</script>

<template>
  <div class="history-sorter-game">
    <div class="game-header">
      <h1>历史事件排序 📜</h1>
      <p>请将以下中国历史事件按时间先后顺序（从古至今）进行排序：</p>
    </div>
    <div class="game-area">
      <div class="events-container">
        <div
          v-for="(event, index) in events"
          :key="event.id"
          class="event-item"
          :class="{ 
            'correct': isSorted && event.id === sortedEvents[index]?.id, 
            'incorrect': isSorted && event.id !== sortedEvents[index]?.id,
            'dragging': touchItem === index
          }"
          :data-index="index"
          draggable="true"
          @dragstart="handleDragStart($event, index)"
          @dragover="handleDragOver"
          @drop="handleDrop($event, index)"
          @touchstart="handleTouchStart($event, index)"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          {{ event.description }}
        </div>
      </div>
      <div class="controls">
        <button @click="checkOrder">检查顺序</button>
        <button @click="resetGame">重新开始</button>
      </div>
      <div v-if="feedback" class="feedback">{{ feedback }}</div>
    </div>
  </div>
</template>

<style scoped>
.history-sorter-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

.game-header {
  text-align: center;
  margin-bottom: 20px;
}

.events-container {
  width: 100%;
  max-width: 600px;
}

.event-item {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: move;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.event-item:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.event-item.correct {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.event-item.incorrect {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.controls {
  margin-top: 20px;
  text-align: center;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #42b883;
  color: white;
  transition: background-color 0.3s ease;
  margin: 0 10px;
}

button:hover {
  background-color: #35495e;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.feedback {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  max-width: 600px;
}

.feedback.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.feedback.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .history-sorter-game {
    padding: 15px;
  }
  
  .event-item {
    padding: 12px;
    margin-bottom: 8px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 14px;
    margin: 5px;
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .history-sorter-game {
    padding: 10px;
  }
  
  .event-item {
    padding: 10px;
    font-size: 14px;
  }
  
  .game-header h1 {
    font-size: 24px;
  }
}
</style>
