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
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  events.push(...shuffled);
  isSorted.value = false;
  feedback.value = "";
};

// --- 拖拽相关 ---
const dragItem = ref<number | null>(null);

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

  const draggedItem = events[dragItem.value];
  events.splice(dragItem.value, 1);
  events.splice(targetIndex, 0, draggedItem);
  
  dragItem.value = null; // Reset drag item
};

// --- 检查排序 ---
const checkOrder = () => {
  isSorted.value = true;
  let correct = true;
  for (let i = 0; i < events.length; i++) {
    if (events[i].id !== sortedEvents.value[i].id) {
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
    <h2>历史事件排序 📜</h2>
    <p>请将以下中国历史事件按时间先后顺序（从古至今）进行排序：</p>
    <div class="game-area">
      <div class="events-container">
        <div
          v-for="(event, index) in events"
          :key="event.id"
          class="event-item"
          :class="{ 'correct': isSorted && event.id === sortedEvents[index]?.id, 'incorrect': isSorted && event.id !== sortedEvents[index]?.id }"
          draggable="true"
          @dragstart="handleDragStart($event, index)"
          @dragover="handleDragOver"
          @drop="handleDrop($event, index)"
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
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 600px;
  margin: 0 auto;
}

.game-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.events-container {
  width: 100%;
  min-height: 300px;
  border: 1px dashed #aaa;
  padding: 10px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.event-item {
  padding: 15px;
  margin: 10px 0;
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 4px;
  cursor: move; /* Show it's draggable */
  transition: background-color 0.2s ease, transform 0.1s ease;
  user-select: none; /* Prevent text selection during drag */
}

.event-item:hover {
  background-color: #bbdefb;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.event-item.correct {
  background-color: #c8e6c9; /* Light green */
  border-color: #4caf50;
}

.event-item.incorrect {
  background-color: #ffcdd2; /* Light red */
  border-color: #f44336;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #2196f3;
  color: white;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #1976d2;
}

.feedback {
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
  text-align: center;
}
</style>
