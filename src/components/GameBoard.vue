<template>
  <div class="game-container">
    <div class="game-info">
      <div class="score-board">
        <div class="player-score">
          <span class="player-label">玩家分数:</span>
          <span class="score">{{ playerScore }}</span>
        </div>
        <div class="ai-score">
          <span class="ai-label">AI分数:</span>
          <span class="score">{{ aiScore }}</span>
        </div>
      </div>
      <div class="game-status">
        <span v-if="gameStatus === 'running'">游戏进行中</span>
        <span v-else-if="gameStatus === 'paused'">游戏暂停</span>
        <span v-else-if="gameStatus === 'over'" class="game-over">游戏结束</span>
      </div>
    </div>
    
    <canvas ref="gameCanvas" class="game-canvas"></canvas>
    
    <div v-if="gameStatus === 'over'" class="game-over-panel">
      <h2>游戏结束</h2>
      <p v-if="gameResult === 'player'" class="result-win">恭喜你获胜了！</p>
      <p v-else-if="gameResult === 'ai'" class="result-lose">AI获胜了，再接再厉！</p>
      <p v-else class="result-draw">平局！</p>
      <p class="result-description">{{ gameResultDescription }}</p>
      <button @click="restartGame">重新开始</button>
      <button @click="backToMenu">返回菜单</button>
    </div>
    
    <div class="game-controls" v-if="!isMobileDevice || gameStatus === 'over'">
      <button @click="togglePause">{{ gameStatus === 'paused' ? '继续' : '暂停' }}</button>
      <button @click="backToMenu">返回菜单</button>
    </div>
    
    <!-- 移动端虚拟方向键 -->
    <div class="virtual-controls" v-if="isMobileDevice && gameStatus !== 'over'">
      <div class="direction-buttons">
        <button class="direction-btn up-btn" @touchstart.prevent="handleDirectionTouch('up')">
          <span class="arrow">↑</span>
        </button>
        <div class="horizontal-buttons">
          <button class="direction-btn left-btn" @touchstart.prevent="handleDirectionTouch('left')">
            <span class="arrow">←</span>
          </button>
          <button class="direction-btn right-btn" @touchstart.prevent="handleDirectionTouch('right')">
            <span class="arrow">→</span>
          </button>
        </div>
        <button class="direction-btn down-btn" @touchstart.prevent="handleDirectionTouch('down')">
          <span class="arrow">↓</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useSnakeGame } from '../composables/useSnakeGame';

const props = defineProps({
  gameConfig: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['back-to-menu']);

const gameCanvas = ref(null);
const playerScore = ref(0);
const aiScore = ref(0);
const gameStatus = ref('running');
const gameResult = ref(null); // 'player', 'ai', 或 'draw'
const gameResultDescription = ref('');

// 检测是否为移动设备
const isMobileDevice = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
});

// 处理虚拟方向键的触摸事件
const handleDirectionTouch = (direction) => {
  if (gameStatus.value !== 'running') return;
  updatePlayerDirection(direction);
};

// 游戏逻辑初始化
const {
  initGame,
  startGameLoop,
  stopGameLoop,
  pauseGame,
  resumeGame,
  restartGame: resetGame,
  updatePlayerDirection,
  getPlayerScore,
  getAiScore,
  isGameOver,
  getWinner,
  getGameResultDescription
} = useSnakeGame();

// 监听键盘事件
const handleKeyDown = (event) => {
  if (gameStatus.value !== 'running') return;
  
  switch (event.key) {
    case 'ArrowUp':
      updatePlayerDirection('up');
      break;
    case 'ArrowDown':
      updatePlayerDirection('down');
      break;
    case 'ArrowLeft':
      updatePlayerDirection('left');
      break;
    case 'ArrowRight':
      updatePlayerDirection('right');
      break;
    case ' ':
      togglePause();
      break;
  }
};

// 游戏状态更新
const updateGameState = () => {
  playerScore.value = getPlayerScore();
  aiScore.value = getAiScore();
  
  if (isGameOver()) {
    gameStatus.value = 'over';
    gameResult.value = getWinner();
    gameResultDescription.value = getGameResultDescription();
    stopGameLoop();
  }
};

// 暂停/继续游戏
const togglePause = () => {
  if (gameStatus.value === 'over') return;
  
  if (gameStatus.value === 'running') {
    pauseGame();
    gameStatus.value = 'paused';
  } else {
    resumeGame();
    gameStatus.value = 'running';
  }
};

// 重新开始游戏
const restartGame = () => {
  resetGame(props.gameConfig);
  playerScore.value = 0;
  aiScore.value = 0;
  gameStatus.value = 'running';
  gameResult.value = null;
  gameResultDescription.value = '';
  startGameLoop(); // 确保游戏循环重新启动
};

// 返回菜单
const backToMenu = () => {
  stopGameLoop();
  emit('back-to-menu');
};

// 监听配置变化
watch(() => props.gameConfig, (newConfig) => {
  restartGame();
}, { deep: true });

// 组件挂载时初始化游戏
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  
  if (gameCanvas.value) {
    initGame(gameCanvas.value, props.gameConfig, updateGameState);
    startGameLoop();
  }
});

// 组件卸载时清理资源
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  stopGameLoop();
});
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.game-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.score-board {
  display: flex;
  gap: 2rem;
}

.player-score, .ai-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.player-label {
  color: #4a9c5d;
  font-weight: bold;
}

.ai-label {
  color: #d35400;
  font-weight: bold;
}

.score {
  font-size: 1.2rem;
  font-weight: bold;
}

.game-status {
  font-weight: bold;
}

.game-over {
  color: #e74c3c;
}

.game-canvas {
  border: 4px solid #4a9c5d;
  border-radius: 10px;
  background-color: #f0f8ff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}

.game-over-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 10;
  min-width: 300px;
}

.game-over-panel h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

.result-win {
  color: #2ecc71;
  font-weight: bold;
  font-size: 1.2rem;
}

.result-lose {
  color: #e74c3c;
  font-weight: bold;
  font-size: 1.2rem;
}

.result-draw {
  color: #3498db;
  font-weight: bold;
  font-size: 1.2rem;
}

.result-description {
  margin: 1rem 0;
  padding: 0.8rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-size: 1rem;
  color: #555;
  border-left: 4px solid #3498db;
}

.game-over-panel h2 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.game-over-panel button {
  margin: 0.5rem;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  border-radius: 50px;
  border: none;
  background-color: #4a9c5d;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-over-panel button:hover {
  background-color: #3d8b50;
  transform: translateY(-2px);
}

.game-controls {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.game-controls button {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  border-radius: 50px;
  border: none;
  background-color: #4a9c5d;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-controls button:hover {
  background-color: #3d8b50;
  transform: translateY(-2px);
}

/* 移动端虚拟方向键样式 */
.virtual-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: 100%;
  max-width: 300px;
}

.direction-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.horizontal-buttons {
  display: flex;
  gap: 100px;
  margin: 10px 0;
}

.direction-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(74, 156, 93, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  -webkit-tap-highlight-color: transparent;
}

.direction-btn:active {
  background-color: rgba(61, 139, 80, 0.9);
  transform: scale(0.95);
}

.arrow {
  font-size: 24px;
  color: white;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-canvas {
    max-width: 100%;
    max-height: 60vh;
  }
  
  .game-info {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .game-controls {
    flex-direction: column;
    gap: 10px;
  }
}
</style>