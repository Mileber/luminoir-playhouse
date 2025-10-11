# luminoir-playhouse

这是一个基于 Vue 3、Vite 和 TypeScript 构建的多合一游戏平台，包含多种益智游戏，可作为渐进式Web应用(PWA)运行。

## 项目概述

luminoir-playhouse 是一个集合了多种经典小游戏的Web应用平台。该项目使用现代化的前端技术栈构建，支持PWA功能，可以在设备上安装使用。

## 技术栈

- [Vue 3](https://v3.cn.vuejs.org/) - 渐进式JavaScript框架
- [Vite](https://vitejs.dev/) - 快速的构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript的超集，添加了静态类型
- [Pinia](https://pinia.vuejs.org/) - Vue的状态管理库
- [Vue Router](https://router.vuejs.org/) - Vue.js的官方路由管理器
- [vite-plugin-pwa](https://vite-plugin-pwa.netlify.app/) - 为Vite提供PWA支持的插件

## 目录结构

```
src/
├── components/
│   └── games/              # 游戏组件
│       ├── Game2048.vue           # 2048游戏
│       ├── GomokuGame.vue         # 五子棋游戏
│       ├── HistorySorterGame.vue  # 历史事件排序游戏
│       ├── KlotskiGame.vue        # 华容道游戏
│       ├── MagicTower.vue         # 魔塔游戏
│       ├── MemoryGame.vue         # 记忆翻牌游戏
│       ├── MinesweeperGame.vue    # 扫雷游戏
│       ├── SheepGame.vue          # 羊了个羊游戏
│       ├── SnakeGame.vue          # 贪吃蛇游戏
│       ├── SokobanGame.vue        # 推箱子游戏
│       ├── SpiderSolitaire.vue    # 蜘蛛纸牌游戏
│       ├── SudokuGame.vue         # 数独游戏
│       ├── SudokuGenerator.ts     # 数独生成器
│       └── TetrisGame.vue         # 俄罗斯方块游戏
├── router/
│   └── index.ts            # 路由配置
├── stores/
│   └── counter.ts          # Pinia状态存储示例
├── views/
│   └── HomeView.vue        # 主页视图
├── App.vue                 # 根组件
└── main.ts                 # 应用入口
```

## 开发环境搭建

### 环境要求

- Node.js 版本: ^20.19.0 || >=22.12.0

### 安装步骤

```sh
npm install
```

## 项目运行命令

```sh
# 启动开发服务器（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run type-check

# 代码检查和自动修复
npm run lint

# 代码格式化
npm run format

# 部署到GitHub Pages
npm run deploy
```

## 核心功能模块

### 1. 扫雷游戏 (/games/minesweeper)

经典的扫雷游戏实现，包含以下功能：
- 9x9的游戏网格
- 10个地雷随机分布
- 左键点击揭示方块
- 右键点击标记/取消标记地雷
- 获胜和失败检测

### 2. 历史事件排序游戏 (/games/history-sorter)

一个教育性的历史游戏，玩家需要按时间顺序排列历史事件：
- 提供多个中国历史重要事件
- 拖拽排序功能
- 自动检查答案正确性
- 显示正确的时间线

### 3. 俄罗斯方块游戏 (/games/tetris)

经典的俄罗斯方块游戏实现，包含以下功能：
- 标准俄罗斯方块规则
- 显示下一个方块预览
- 支持键盘和触摸屏操作
- 移动端适配的控制按钮
- 分数计算和游戏结束检测

### 4. 2048游戏 (/games/2048)

流行的2048数字合成游戏，包含以下功能：
- 4x4的游戏网格
- 滑动合并相同数字的方块
- 支持键盘和触摸屏操作
- 分数计算和游戏结束检测
- 胜利条件：合成2048方块

### 5. 五子棋游戏 (/games/gomoku)

经典的五子棋游戏实现，包含以下功能：
- 400x400像素的画布游戏区域
- 黑白棋交替落子
- 黑棋先行规则
- 棋子落在棋盘交叉点上
- 连成五子判定胜利
- 游戏结束提示和重新开始功能

### 6. 华容道游戏 (/games/klotski)

经典的华容道滑块游戏，包含以下功能：
- 多种难度级别的关卡
- 拖拽滑块移动
- 步数统计
- 游戏胜利检测

### 7. 魔塔游戏 (/games/magic-tower)

经典的魔塔RPG游戏，包含以下功能：
- 多层地图探索
- 战斗系统
- 道具收集和使用
- 商店系统
- NPC交互
- 任务系统
- 存档系统

### 8. 记忆翻牌游戏 (/games/memory)

记忆翻牌游戏，包含以下功能：
- 成对卡片匹配
- 计时和步数统计
- 不同难度级别
- 游戏胜利检测

### 9. 羊了个羊游戏 (/games/sheep)

流行的消除类游戏，包含以下功能：
- 三层堆叠消除玩法
- 随机关卡生成
- 洗牌和撤销功能
- 得分系统

### 10. 贪吃蛇游戏 (/games/snake)

经典的贪吃蛇游戏，包含以下功能：
- 蛇的移动和生长
- 食物生成
- 碰撞检测
- 分数统计
- 游戏结束检测

### 11. 推箱子游戏 (/games/sokoban)

经典的推箱子益智游戏，包含以下功能：
- 多关卡设计
- 箱子推动机制
- 目标点匹配检测
- 步数统计
- 关卡重置功能

### 12. 蜘蛛纸牌游戏 (/games/spider-solitaire)

经典的蜘蛛纸牌游戏，包含以下功能：
- 标准纸牌规则
- 四种花色模式
- 自动收牌检测
- 撤销操作
- 重新开始功能

### 13. 数独游戏 (/games/sudoku)

经典的数独游戏，包含以下功能：
- 标准9x9数独规则
- 难度级别选择
- 错误检测
- 提示功能
- 自动检查答案

### 14. 主页

主页包含导航到各个游戏的链接，用户可以从这里选择想要玩的游戏。

## 项目配置

### 环境配置

项目支持通过 `package.json` 中的 `homepage` 字段配置部署路径，Vite配置会自动读取该字段并设置正确的基础路径。

### PWA配置

项目使用 `vite-plugin-pwa` 插件提供PWA功能，用户可以将应用安装到设备上离线使用。

### 构建配置

构建配置位于 `vite.config.ts` 文件中，包含：
- Vue插件配置
- PWA插件配置
- 路径别名配置
- 基础路径自动设置

## 开发规范

- 使用TypeScript进行类型检查
- 使用ESLint和Prettier保持代码风格一致
- 使用Vue 3 Composition API编写组件
- 遵循Vue官方推荐的项目结构