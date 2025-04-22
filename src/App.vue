<script setup>
import { ref } from 'vue';
import StartScreen from './components/StartScreen.vue';
import GameBoard from './components/GameBoard.vue';

// 游戏状态管理
const gameStarted = ref(false);
const gameConfig = ref({
  difficulty: 'medium',
  mapSize: 'medium',
  aiLevel: 'medium'
});

// 开始游戏
const handleStartGame = (config) => {
  gameConfig.value = config;
  gameStarted.value = true;
};

// 返回菜单
const handleBackToMenu = () => {
  gameStarted.value = false;
};
</script>

<template>
  <div class="app-container">
    <div class="game-wrapper">
      <StartScreen v-if="!gameStarted" @start-game="handleStartGame" />
      <GameBoard v-else :gameConfig="gameConfig" @back-to-menu="handleBackToMenu" />
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

body {
  background-color: #e0f7fa;
  background-image: linear-gradient(45deg, #e0f7fa 25%, #b2ebf2 25%, #b2ebf2 50%, #e0f7fa 50%, #e0f7fa 75%, #b2ebf2 75%, #b2ebf2 100%);
  background-size: 40px 40px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.game-wrapper {
  width: 100%;
  max-width: 800px;
  height: 80vh;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
}
</style>
