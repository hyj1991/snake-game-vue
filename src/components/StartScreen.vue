<template>
  <div class="start-screen">
    <div class="game-title">
      <h1>贪食蛇大作战</h1>
    </div>
    
    <div class="game-config">
      <div class="config-item">
        <label>游戏难度：</label>
        <select v-model="difficulty">
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
      
      <div class="config-item">
        <label>地图大小：</label>
        <select v-model="mapSize">
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
        </select>
      </div>
      
      <div class="config-item">
        <label>AI难度：</label>
        <select v-model="aiLevel">
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
    </div>
    
    <div class="start-button">
      <button @click="startGame">开始游戏</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const difficulty = ref('medium');
const mapSize = ref('medium');
const aiLevel = ref('medium');

const emit = defineEmits(['start-game']);

const startGame = () => {
  emit('start-game', {
    difficulty: difficulty.value,
    mapSize: mapSize.value,
    aiLevel: aiLevel.value
  });
};
</script>

<style scoped>
.start-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f0f8ff;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.game-title {
  margin-bottom: 2rem;
}

.game-title h1 {
  font-size: 3rem;
  color: #4a9c5d;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.game-config {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  width: 80%;
  max-width: 400px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-item label {
  font-size: 1.2rem;
  color: #555;
  font-weight: bold;
}

.config-item select {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 2px solid #4a9c5d;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.config-item select:hover {
  border-color: #3d8b50;
}

.start-button button {
  padding: 0.8rem 2rem;
  font-size: 1.5rem;
  background-color: #4a9c5d;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.start-button button:hover {
  background-color: #3d8b50;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.start-button button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>