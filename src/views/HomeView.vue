<script setup lang="ts">
// import TheWelcome from '../components/TheWelcome.vue' // 可以注释掉或删除不用的组件
</script>

<template>
  <main>
    <h1 style="text-align:center;">欢迎来到我的多合一游戏PWA!</h1>
    <nav style="display:flex; justify-content:center; gap:20px; margin-bottom: 20px; flex-wrap: wrap;">
       <router-link to="/games/minesweeper"><button>开始扫雷游戏</button></router-link>
       <router-link to="/games/history-sorter"><button>开始历史排序游戏</button></router-link>
    </nav>
    <hr/>
    <!-- <TheWelcome />  可以暂时移除或替换为其他内容 -->
    <div style="text-align: center; padding: 20px;">
        <p>请选择上方的游戏开始体验吧！</p>
    </div>
  </main>
</template>

<style scoped>
 button {
   padding: 15px 25px;
   font-size: large;
   cursor: pointer;
   border: none;
   border-radius: 8px;
   background-color: #42b883; /* Vue green */
   color: white;
   transition: background-color 0.3s ease, transform 0.2s ease;
 }

 button:hover {
   background-color: #35495e; /* Vue dark */
   transform: scale(1.05);
 }
</style>
