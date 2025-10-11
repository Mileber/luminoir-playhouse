import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/minesweeper',
      name: 'minesweeper',
      component: () => import('../components/games/MinesweeperGame.vue')
    },
    {
      path: '/chrono-quest',
      name: 'chrono-quest',
      component: () => import('../components/games/HistorySorterGame.vue')
    },
    {
      path: '/tetris',
      name: 'tetris',
      component: () => import('../components/games/TetrisGame.vue')
    },
    {
      path: '/2048',
      name: '2048',
      component: () => import('../components/games/Game2048.vue')
    },
    {
      path: '/gobang',
      name: 'gobang',
      component: () => import('../components/games/GomokuGame.vue')
    },
    {
      path: '/sudoku',
      name: 'sudoku',
      component: () => import('../components/games/SudokuGame.vue')
    },
    {
      path: '/snake',
      name: 'snake',
      component: () => import('../components/games/SnakeGame.vue')
    },
    {
      path: '/memory',
      name: 'memory',
      component: () => import('../components/games/MemoryGame.vue')
    },
    {
      path: '/sheep',
      name: 'sheep',
      component: () => import('../components/games/SheepGame.vue')
    },
    {
      path: '/klotski',
      name: 'klotski',
      component: () => import('../components/games/KlotskiGame.vue')
    },
    {
      path: '/sokoban',
      name: 'sokoban',
      component: () => import('../components/games/SokobanGame.vue')
    },
    {
      path: '/spider',
      name: 'spider',
      component: () => import('../components/games/SpiderSolitaire.vue')
    },
    {
      path: '/magictower',
      name: 'magictower',
      component: () => import('../components/games/MagicTower.vue')
    }
  ]
})

export default router