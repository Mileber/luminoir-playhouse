import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
// 导入新的游戏组件
import MinesweeperGame from '@/components/games/MinesweeperGame.vue'
import HistorySorterGame from '@/components/games/HistorySorterGame.vue'
import TetrisGame from '@/components/games/TetrisGame.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    // --- 新增的游戏路由 ---
    {
      path: '/games/minesweeper',
      name: 'Minesweeper',
      component: MinesweeperGame
    },
    {
      path: '/games/history-sorter',
      name: 'HistorySorter',
      component: HistorySorterGame
    },
    {
      path: '/games/tetris',
      name: 'Tetris',
      component: TetrisGame
    }
    // ----------------------
  ]
})

export default router