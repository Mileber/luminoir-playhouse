import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Game2048 from '@/components/games/Game2048.vue'
import GomokuGame from '@/components/games/GomokuGame.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/games/minesweeper',
      name: 'minesweeper',
      component: () => import('@/components/games/MinesweeperGame.vue')
    },
    {
      path: '/games/history-sorter',
      name: 'history-sorter',
      component: () => import('@/components/games/HistorySorterGame.vue')
    },
    {
      path: '/games/tetris',
      name: 'tetris',
      component: () => import('@/components/games/TetrisGame.vue')
    },
    {
      path: '/games/2048',
      name: '2048',
      component: Game2048
    },
    {
      path: '/games/gomoku',
      name: 'gomoku',
      component: GomokuGame
    }
  ]
})

export default router