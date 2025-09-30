<template>
  <div class="home">
    <h1 style="text-align:center;">欢迎来到我的多合一游戏PWA!</h1>

    <div class="game-links">
      <div class="game-buttons">
        <button @click="$router.push('/games/minesweeper')">扫雷</button>
        <button @click="$router.push('/games/history-sorter')">历史事件排序</button>
        <button @click="$router.push('/games/tetris')">俄罗斯方块</button>
        <button @click="$router.push('/games/2048')">2048</button>
      </div>
    </div>
    <div style="text-align: center; padding: 20px;">
      <p>请选择上方的游戏开始体验吧！</p>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.game-links {
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.game-links h2 {
  margin-bottom: 20px;
  color: #333;
}

.game-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
}

.game-buttons button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  min-width: 120px;
}

.game-buttons button:hover {
  background-color: #369870;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .home {
    padding: 15px;
  }

  .game-buttons {
    flex-direction: column;
    align-items: center;
  }

  .game-buttons button {
    width: 100%;
    max-width: 250px;
    padding: 15px;
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .home {
    padding: 10px;
  }

  .logo {
    width: 100px;
    height: 100px;
  }

  .game-buttons button {
    padding: 12px;
    font-size: 16px;
    min-width: 200px;
  }
}
</style>