<template>
  <div class="home">
    <div class="container">
      <h1>欢迎来到益智游戏屋</h1>
      <div class="game-grid">
        <router-link to="/minesweeper" class="game-card">
          <div class="game-icon">💣</div>
          <h2>扫雷</h2>
          <p>经典扫雷游戏</p>
        </router-link>
        
        <router-link to="/chrono-quest" class="game-card">
          <div class="game-icon">📜</div>
          <h2>历史事件排序</h2>
          <p>中国历史事件排序</p>
        </router-link>
        
        <router-link to="/tetris" class="game-card">
          <div class="game-icon">🔳</div>
          <h2>俄罗斯方块</h2>
          <p>经典俄罗斯方块</p>
        </router-link>
        
        <router-link to="/2048" class="game-card">
          <div class="game-icon">²⁰⁴⁸</div>
          <h2>2048</h2>
          <p>数字合成游戏</p>
        </router-link>
        
        <router-link to="/gobang" class="game-card">
          <div class="game-icon">⚫</div>
          <h2>五子棋</h2>
          <p>经典五子棋游戏</p>
        </router-link>
        
        <router-link to="/sudoku" class="game-card">
          <div class="game-icon">🔢</div>
          <h2>数独</h2>
          <p>数字逻辑游戏</p>
        </router-link>
        
        <router-link to="/snake" class="game-card">
          <div class="game-icon">🐍</div>
          <h2>贪吃蛇</h2>
          <p>经典贪吃蛇游戏</p>
        </router-link>
        
        <router-link to="/memory" class="game-card">
          <div class="game-icon">🧠</div>
          <h2>翻翻乐</h2>
          <p>记忆配对游戏</p>
        </router-link>
        
        <router-link to="/sheep" class="game-card">
          <div class="game-icon">🐑</div>
          <h2>羊了个羊</h2>
          <p>消除类益智游戏</p>
        </router-link>
        
        <router-link to="/klotski" class="game-card">
          <div class="game-icon">🧩</div>
          <h2>华容道</h2>
          <p>经典滑块游戏</p>
        </router-link>
        
        <router-link to="/sokoban" class="game-card">
          <div class="game-icon">📦</div>
          <h2>推箱子</h2>
          <p>经典推箱子游戏</p>
        </router-link>
        
        <router-link to="/spider" class="game-card">
          <div class="game-icon">♠</div>
          <h2>蜘蛛纸牌</h2>
          <p>经典纸牌游戏</p>
        </router-link>
        
        <router-link to="/magictower" class="game-card">
          <div class="game-icon">🏰</div>
          <h2>魔塔</h2>
          <p>经典RPG解谜游戏</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'HomeView'
})
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  width: 100%;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.game-card {
  display: block;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  color: #333;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e9ecef;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: #333;
}

.game-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

h2 {
  margin: 0 0 10px 0;
  color: #495057;
}

p {
  margin: 0;
  color: #6c757d;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .game-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .game-card {
    padding: 15px;
  }
  
  h1 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .home {
    padding: 10px;
  }
  
  .game-grid {
    grid-template-columns: 1fr;
  }
  
  .game-card {
    padding: 15px;
  }
}
</style>