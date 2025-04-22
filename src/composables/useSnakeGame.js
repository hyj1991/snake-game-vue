import { ref } from 'vue';

export function useSnakeGame() {
  // 游戏状态
  const canvas = ref(null);
  const ctx = ref(null);
  const gameConfig = ref(null);
  const gameLoop = ref(null);
  const updateCallback = ref(null);
  
  // 游戏参数
  const cellSize = ref(20); // 每个格子的大小
  const gridWidth = ref(0);
  const gridHeight = ref(0);
  
  // 玩家蛇
  const playerSnake = ref({
    body: [],
    direction: 'right',
    nextDirection: 'right',
    color: '#4a9c5d',
    score: 0
  });
  
  // AI蛇
  const aiSnake = ref({
    body: [],
    direction: 'left',
    color: '#d35400',
    score: 0
  });
  
  // 食物
  const foods = ref([]);
  
  // 游戏状态
  const gameOver = ref(false);
  const gamePaused = ref(false);
  
  // 初始化游戏
  const initGame = (canvasElement, config, callback) => {
    canvas.value = canvasElement;
    gameConfig.value = config;
    updateCallback.value = callback;
    
    // 设置画布大小
    setCanvasSize();
    
    // 初始化游戏上下文
    ctx.value = canvas.value.getContext('2d');
    
    // 根据难度设置游戏速度
    const gameSpeeds = {
      easy: 150,
      medium: 100,
      hard: 70
    };
    
    // 重置游戏状态
    resetGameState();
    
    // 设置游戏循环
    if (gameLoop.value) {
      clearInterval(gameLoop.value);
    }
    
    gameLoop.value = setInterval(() => {
      if (!gamePaused.value && !gameOver.value) {
        update();
        render();
        if (updateCallback.value) {
          updateCallback.value();
        }
      }
    }, gameSpeeds[gameConfig.value.difficulty]);
  };
  
  // 设置画布大小
  const setCanvasSize = () => {
    const mapSizes = {
      small: { width: 20, height: 15 },
      medium: { width: 30, height: 20 },
      large: { width: 40, height: 25 }
    };
    
    gridWidth.value = mapSizes[gameConfig.value.mapSize].width;
    gridHeight.value = mapSizes[gameConfig.value.mapSize].height;
    
    canvas.value.width = gridWidth.value * cellSize.value;
    canvas.value.height = gridHeight.value * cellSize.value;
  };
  
  // 重置游戏状态
  const resetGameState = () => {
    // 重置玩家蛇
    playerSnake.value = {
      body: [
        { x: Math.floor(gridWidth.value / 4), y: Math.floor(gridHeight.value / 2) },
        { x: Math.floor(gridWidth.value / 4) - 1, y: Math.floor(gridHeight.value / 2) },
        { x: Math.floor(gridWidth.value / 4) - 2, y: Math.floor(gridHeight.value / 2) }
      ],
      direction: 'right',
      nextDirection: 'right',
      color: '#4a9c5d',
      score: 0
    };
    
    // 重置AI蛇
    aiSnake.value = {
      body: [
        { x: Math.floor(gridWidth.value * 3 / 4), y: Math.floor(gridHeight.value / 2) },
        { x: Math.floor(gridWidth.value * 3 / 4) + 1, y: Math.floor(gridHeight.value / 2) },
        { x: Math.floor(gridWidth.value * 3 / 4) + 2, y: Math.floor(gridHeight.value / 2) }
      ],
      direction: 'left',
      color: '#d35400',
      score: 0
    };
    
    // 重置食物
    foods.value = [];
    for (let i = 0; i < 3; i++) {
      spawnFood();
    }
    
    // 重置游戏状态
    gameOver.value = false;
    gamePaused.value = false;
    winner.value = null;
  };
  
  // 生成食物
  const spawnFood = () => {
    let newFood;
    let validPosition = false;
    
    while (!validPosition) {
      newFood = {
        x: Math.floor(Math.random() * gridWidth.value),
        y: Math.floor(Math.random() * gridHeight.value),
        color: getRandomFoodColor()
      };
      
      validPosition = true;
      
      // 检查是否与玩家蛇重叠
      for (const segment of playerSnake.value.body) {
        if (segment.x === newFood.x && segment.y === newFood.y) {
          validPosition = false;
          break;
        }
      }
      
      // 检查是否与AI蛇重叠
      if (validPosition) {
        for (const segment of aiSnake.value.body) {
          if (segment.x === newFood.x && segment.y === newFood.y) {
            validPosition = false;
            break;
          }
        }
      }
      
      // 检查是否与其他食物重叠
      if (validPosition) {
        for (const food of foods.value) {
          if (food.x === newFood.x && food.y === newFood.y) {
            validPosition = false;
            break;
          }
        }
      }
    }
    
    foods.value.push(newFood);
  };
  
  // 获取随机食物颜色
  const getRandomFoodColor = () => {
    const colors = ['#e74c3c', '#f1c40f', '#3498db', '#9b59b6', '#2ecc71'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // 更新游戏状态
  const update = () => {
    // 更新玩家蛇方向
    playerSnake.value.direction = playerSnake.value.nextDirection;
    
    // 更新AI蛇方向
    updateAiDirection();
    
    // 移动玩家蛇
    moveSnake(playerSnake.value);
    
    // 移动AI蛇
    moveSnake(aiSnake.value);
    
    // 检查碰撞
    checkCollisions();
    
    // 检查食物
    checkFood();
  };
  
  // 移动蛇
  const moveSnake = (snake) => {
    const head = { ...snake.body[0] };
    
    // 根据方向移动头部
    switch (snake.direction) {
      case 'up':
        head.y -= 1;
        break;
      case 'down':
        head.y += 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }
    
    // 将新头部添加到蛇身体的前面
    snake.body.unshift(head);
    
    // 移除尾部（除非吃到食物）
    snake.body.pop();
  };
  
  // 更新AI方向
  const updateAiDirection = () => {
    const aiHead = aiSnake.value.body[0];
    let nearestFood = null;
    let minDistance = Infinity;
    
    // 根据AI难度调整AI的智能程度
    const randomFactor = {
      easy: 0.4,      // 40%的随机移动
      medium: 0.2,    // 20%的随机移动
      hard: 0.05      // 5%的随机移动
    }[gameConfig.value.aiLevel];
    
    // 随机移动
    if (Math.random() < randomFactor) {
      const directions = ['up', 'down', 'left', 'right'];
      const oppositeDirections = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left'
      };
      
      // 过滤掉与当前方向相反的方向
      const validDirections = directions.filter(dir => dir !== oppositeDirections[aiSnake.value.direction]);
      aiSnake.value.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
      return;
    }
    
    // 寻找最近的食物
    for (const food of foods.value) {
      const distance = Math.abs(food.x - aiHead.x) + Math.abs(food.y - aiHead.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearestFood = food;
      }
    }
    
    if (nearestFood) {
      // 计算到食物的水平和垂直距离
      const dx = nearestFood.x - aiHead.x;
      const dy = nearestFood.y - aiHead.y;
      
      // 避免自身碰撞的智能移动
      const possibleDirections = [];
      
      // 水平移动
      if (dx > 0 && aiSnake.value.direction !== 'left') {
        possibleDirections.push({ dir: 'right', priority: Math.abs(dx) });
      } else if (dx < 0 && aiSnake.value.direction !== 'right') {
        possibleDirections.push({ dir: 'left', priority: Math.abs(dx) });
      }
      
      // 垂直移动
      if (dy > 0 && aiSnake.value.direction !== 'up') {
        possibleDirections.push({ dir: 'down', priority: Math.abs(dy) });
      } else if (dy < 0 && aiSnake.value.direction !== 'down') {
        possibleDirections.push({ dir: 'up', priority: Math.abs(dy) });
      }
      
      // 根据优先级排序可能的方向
      possibleDirections.sort((a, b) => b.priority - a.priority);
      
      // 检查每个方向是否安全（不会导致碰撞）
      for (const dirObj of possibleDirections) {
        if (isSafeDirection(aiSnake.value, dirObj.dir)) {
          aiSnake.value.direction = dirObj.dir;
          return;
        }
      }
      
      // 如果没有安全的方向，尝试任何安全的方向
      const allDirections = ['up', 'down', 'left', 'right'];
      const oppositeDir = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left'
      }[aiSnake.value.direction];
      
      // 过滤掉与当前方向相反的方向
      const validDirections = allDirections.filter(dir => dir !== oppositeDir);
      
      for (const dir of validDirections) {
        if (isSafeDirection(aiSnake.value, dir)) {
          aiSnake.value.direction = dir;
          return;
        }
      }
    }
  };
  
  // 检查方向是否安全（不会导致碰撞）
  const isSafeDirection = (snake, direction) => {
    const head = { ...snake.body[0] };
    
    // 根据方向移动头部
    switch (direction) {
      case 'up':
        head.y -= 1;
        break;
      case 'down':
        head.y += 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }
    
    // 检查是否会撞墙
    if (head.x < 0 || head.x >= gridWidth.value || head.y < 0 || head.y >= gridHeight.value) {
      return false;
    }
    
    // 检查是否会碰到自己
    for (let i = 0; i < snake.body.length - 1; i++) {
      if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
        return false;
      }
    }
    
    // 检查是否会碰到玩家蛇
    if (snake === aiSnake.value) {
      for (const segment of playerSnake.value.body) {
        if (head.x === segment.x && head.y === segment.y) {
          return false;
        }
      }
    }
    
    // 检查是否会碰到AI蛇
    if (snake === playerSnake.value) {
      for (const segment of aiSnake.value.body) {
        if (head.x === segment.x && head.y === segment.y) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  // 游戏结果状态
  const winner = ref(null); // 'player', 'ai', 或 'draw'
  
  // 检查碰撞
  const checkCollisions = () => {
    const playerHead = playerSnake.value.body[0];
    const aiHead = aiSnake.value.body[0];
    let playerDied = false;
    let aiDied = false;
    
    // 检查玩家蛇是否撞墙
    if (playerHead.x < 0 || playerHead.x >= gridWidth.value || playerHead.y < 0 || playerHead.y >= gridHeight.value) {
      playerDied = true;
    }
    
    // 检查AI蛇是否撞墙
    if (aiHead.x < 0 || aiHead.x >= gridWidth.value || aiHead.y < 0 || aiHead.y >= gridHeight.value) {
      aiDied = true;
    }
    
    // 检查玩家蛇是否碰到自己
    if (!playerDied) {
      for (let i = 1; i < playerSnake.value.body.length; i++) {
        if (playerHead.x === playerSnake.value.body[i].x && playerHead.y === playerSnake.value.body[i].y) {
          playerDied = true;
          break;
        }
      }
    }
    
    // 检查AI蛇是否碰到自己
    if (!aiDied) {
      for (let i = 1; i < aiSnake.value.body.length; i++) {
        if (aiHead.x === aiSnake.value.body[i].x && aiHead.y === aiSnake.value.body[i].y) {
          aiDied = true;
          break;
        }
      }
    }
    
    // 检查玩家蛇是否碰到AI蛇
    if (!playerDied) {
      for (const segment of aiSnake.value.body) {
        if (playerHead.x === segment.x && playerHead.y === segment.y) {
          playerDied = true;
          break;
        }
      }
    }
    
    // 检查AI蛇是否碰到玩家蛇
    if (!aiDied) {
      for (const segment of playerSnake.value.body) {
        if (aiHead.x === segment.x && aiHead.y === segment.y) {
          aiDied = true;
          break;
        }
      }
    }
    
    // 判断游戏结果
    if (playerDied || aiDied) {
      gameOver.value = true;
      
      // 判断胜负
      if (playerDied && aiDied) {
        // 同时死亡，平局
        winner.value = 'draw';
      } else if (playerDied) {
        // 玩家死亡，AI获胜
        winner.value = 'ai';
      } else {
        // AI死亡，玩家获胜
        winner.value = 'player';
      }
    }
  };
  
  // 检查食物
  const checkFood = () => {
    const playerHead = playerSnake.value.body[0];
    const aiHead = aiSnake.value.body[0];
    
    // 检查玩家是否吃到食物
    for (let i = 0; i < foods.value.length; i++) {
      if (playerHead.x === foods.value[i].x && playerHead.y === foods.value[i].y) {
        // 增加分数
        playerSnake.value.score += 10;
        
        // 增加蛇的长度
        const tail = playerSnake.value.body[playerSnake.value.body.length - 1];
        playerSnake.value.body.push({ ...tail });
        
        // 移除食物并生成新食物
        foods.value.splice(i, 1);
        spawnFood();
        break;
      }
    }
    
    // 检查AI是否吃到食物
    for (let i = 0; i < foods.value.length; i++) {
      if (aiHead.x === foods.value[i].x && aiHead.y === foods.value[i].y) {
        // 增加分数
        aiSnake.value.score += 10;
        
        // 增加蛇的长度
        const tail = aiSnake.value.body[aiSnake.value.body.length - 1];
        aiSnake.value.body.push({ ...tail });
        
        // 移除食物并生成新食物
        foods.value.splice(i, 1);
        spawnFood();
        break;
      }
    }
  };
  
  // 渲染游戏
  const render = () => {
    if (!ctx.value) return;
    
    // 清空画布
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    
    // 绘制网格背景
    drawGrid();
    
    // 绘制食物
    for (const food of foods.value) {
      drawFood(food);
    }
    
    // 绘制玩家蛇
    drawSnake(playerSnake.value);
    
    // 绘制AI蛇
    drawSnake(aiSnake.value);
  };
  
  // 绘制网格
  const drawGrid = () => {
    ctx.value.strokeStyle = '#e6e6e6';
    ctx.value.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= gridWidth.value; x++) {
      ctx.value.beginPath();
      ctx.value.moveTo(x * cellSize.value, 0);
      ctx.value.lineTo(x * cellSize.value, canvas.value.height);
      ctx.value.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= gridHeight.value; y++) {
      ctx.value.beginPath();
      ctx.value.moveTo(0, y * cellSize.value);
      ctx.value.lineTo(canvas.value.width, y * cellSize.value);
      ctx.value.stroke();
    }
  };
  
  // 绘制食物
  const drawFood = (food) => {
    ctx.value.fillStyle = food.color;
    ctx.value.beginPath();
    ctx.value.arc(
      food.x * cellSize.value + cellSize.value / 2,
      food.y * cellSize.value + cellSize.value / 2,
      cellSize.value / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.value.fill();
    
    // 添加高光效果
    ctx.value.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.value.beginPath();
    ctx.value.arc(
      food.x * cellSize.value + cellSize.value / 3,
      food.y * cellSize.value + cellSize.value / 3,
      cellSize.value / 6,
      0,
      Math.PI * 2
    );
    ctx.value.fill();
  };
  
  // 绘制蛇
  const drawSnake = (snake) => {
    // 绘制蛇身
    for (let i = 0; i < snake.body.length; i++) {
      const segment = snake.body[i];
      
      // 为蛇身设置渐变色
      const alpha = 1 - (i / snake.body.length) * 0.6;
      ctx.value.fillStyle = i === 0 ? snake.color : `${snake.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      
      // 绘制圆角矩形
      drawRoundedRect(
        segment.x * cellSize.value + 1,
        segment.y * cellSize.value + 1,
        cellSize.value - 2,
        cellSize.value - 2,
        i === 0 ? cellSize.value / 3 : cellSize.value / 5
      );
      
      // 为蛇头添加眼睛
      if (i === 0) {
        drawEyes(segment, snake.direction);
      }
    }
  };
  
  // 绘制圆角矩形
  const drawRoundedRect = (x, y, width, height, radius) => {
    ctx.value.beginPath();
    ctx.value.moveTo(x + radius, y);
    ctx.value.lineTo(x + width - radius, y);
    ctx.value.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.value.lineTo(x + width, y + height - radius);
    ctx.value.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.value.lineTo(x + radius, y + height);
    ctx.value.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.value.lineTo(x, y + radius);
    ctx.value.quadraticCurveTo(x, y, x + radius, y);
    ctx.value.closePath();
    ctx.value.fill();
  };
  
  // 绘制眼睛
  const drawEyes = (head, direction) => {
    const eyeSize = cellSize.value / 6;
    const eyeOffset = cellSize.value / 4;
    let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
    
    // 根据方向设置眼睛位置
    switch (direction) {
      case 'up':
        leftEyeX = head.x * cellSize.value + eyeOffset;
        leftEyeY = head.y * cellSize.value + eyeOffset;
        rightEyeX = head.x * cellSize.value + cellSize.value - eyeOffset - eyeSize;
        rightEyeY = head.y * cellSize.value + eyeOffset;
        break;
      case 'down':
        leftEyeX = head.x * cellSize.value + eyeOffset;
        leftEyeY = head.y * cellSize.value + cellSize.value - eyeOffset - eyeSize;
        rightEyeX = head.x * cellSize.value + cellSize.value - eyeOffset - eyeSize;
        rightEyeY = head.y * cellSize.value + cellSize.value - eyeOffset - eyeSize;
        break;
      case 'left':
        leftEyeX = head.x * cellSize.value + eyeOffset;
        leftEyeY = head.y * cellSize.value + eyeOffset;
        rightEyeX = head.x * cellSize.value + eyeOffset;
        rightEyeY = head.y * cellSize.value + cellSize.value - eyeOffset - eyeSize;
        break;
      case 'right':
        leftEyeX = head.x * cellSize.value + cellSize.value - eyeOffset - eyeSize;
        leftEyeY = head.y * cellSize.value + eyeOffset;
        rightEyeX = head.x * cellSize.value + cellSize.value - eyeOffset - eyeSize;
        rightEyeY = head.y * cellSize.value + cellSize.value - eyeOffset - eyeSize;
        break;
    }
    
    // 绘制眼睛
    ctx.value.fillStyle = 'white';
    ctx.value.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
    ctx.value.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
    
    // 绘制瞳孔
    ctx.value.fillStyle = 'black';
    ctx.value.fillRect(leftEyeX + eyeSize / 4, leftEyeY + eyeSize / 4, eyeSize / 2, eyeSize / 2);
    ctx.value.fillRect(rightEyeX + eyeSize / 4, rightEyeY + eyeSize / 4, eyeSize / 2, eyeSize / 2);
  };
  
  // 更新玩家方向
  const updatePlayerDirection = (direction) => {
    const oppositeDirections = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };
    
    // 防止反向移动
    if (direction !== oppositeDirections[playerSnake.value.direction]) {
      playerSnake.value.nextDirection = direction;
    }
  };
  
  // 开始游戏循环
  const startGameLoop = () => {
    if (!gameLoop.value) {
      const gameSpeeds = {
        easy: 150,
        medium: 100,
        hard: 70
      };
      
      gameLoop.value = setInterval(() => {
        if (!gamePaused.value && !gameOver.value) {
          update();
          render();
          if (updateCallback.value) {
            updateCallback.value();
          }
        }
      }, gameSpeeds[gameConfig.value.difficulty]);
    }
  };
  
  // 停止游戏循环
  const stopGameLoop = () => {
    if (gameLoop.value) {
      clearInterval(gameLoop.value);
      gameLoop.value = null;
    }
  };
  
  // 暂停游戏
  const pauseGame = () => {
    gamePaused.value = true;
  };
  
  // 继续游戏
  const resumeGame = () => {
    gamePaused.value = false;
  };
  
  // 重新开始游戏
  const restartGame = (config) => {
    if (config) {
      gameConfig.value = config;
    }
    
    resetGameState();
    
    // 无论之前是否有游戏循环，都重新创建一个
    if (gameLoop.value) {
      clearInterval(gameLoop.value);
    }
    
    const gameSpeeds = {
      easy: 150,
      medium: 100,
      hard: 70
    };
    
    gameLoop.value = setInterval(() => {
      if (!gamePaused.value && !gameOver.value) {
        update();
        render();
        if (updateCallback.value) {
          updateCallback.value();
        }
      }
    }, gameSpeeds[gameConfig.value.difficulty]);
    
    // 确保游戏状态正确
    gameOver.value = false;
    gamePaused.value = false;
  };
  
  // 获取玩家分数
  const getPlayerScore = () => playerSnake.value.score;
  
  // 获取AI分数
  const getAiScore = () => aiSnake.value.score;
  
  // 检查游戏是否结束
  const isGameOver = () => gameOver.value;
  
  // 获取游戏胜者
  const getWinner = () => winner.value;
  
  // 获取游戏结果详细描述
  const getGameResultDescription = () => {
    if (!gameOver.value) return '';
    
    // 检查是否是因为分数导致的胜负
    if (playerSnake.value.score > aiSnake.value.score && winner.value === 'player') {
      return '恭喜！你的分数更高并且击败了AI！';
    } else if (aiSnake.value.score > playerSnake.value.score && winner.value === 'ai') {
      return 'AI的分数更高，再接再厉！';
    }
    
    // 检查碰撞原因
    const playerHead = playerSnake.value.body[0];
    const aiHead = aiSnake.value.body[0];
    
    // 根据胜者和死亡原因返回描述
    if (winner.value === 'player') {
      // 玩家获胜，AI死亡
      if (aiHead.x < 0 || aiHead.x >= gridWidth.value || aiHead.y < 0 || aiHead.y >= gridHeight.value) {
        return 'AI撞墙了，你获胜了！';
      }
      
      // 检查AI是否撞到了自己
      for (let i = 1; i < aiSnake.value.body.length; i++) {
        if (aiHead.x === aiSnake.value.body[i].x && aiHead.y === aiSnake.value.body[i].y) {
          return 'AI撞到了自己，你获胜了！';
        }
      }
      
      // 检查AI是否撞到了玩家
      for (const segment of playerSnake.value.body) {
        if (aiHead.x === segment.x && aiHead.y === segment.y) {
          return 'AI撞到了你的蛇身，你获胜了！';
        }
      }
      
      return '你击败了AI！';
    } else if (winner.value === 'ai') {
      // AI获胜，玩家死亡
      if (playerHead.x < 0 || playerHead.x >= gridWidth.value || playerHead.y < 0 || playerHead.y >= gridHeight.value) {
        return '你撞墙了，AI获胜了！';
      }
      
      // 检查玩家是否撞到了自己
      for (let i = 1; i < playerSnake.value.body.length; i++) {
        if (playerHead.x === playerSnake.value.body[i].x && playerHead.y === playerSnake.value.body[i].y) {
          return '你撞到了自己，AI获胜了！';
        }
      }
      
      // 检查玩家是否撞到了AI
      for (const segment of aiSnake.value.body) {
        if (playerHead.x === segment.x && playerHead.y === segment.y) {
          return '你撞到了AI的蛇身，AI获胜了！';
        }
      }
      
      return 'AI击败了你！';
    } else {
      // 平局
      return '双方同时死亡，平局！';
    }
  };
  
  return {
    initGame,
    startGameLoop,
    stopGameLoop,
    pauseGame,
    resumeGame,
    restartGame,
    updatePlayerDirection,
    getPlayerScore,
    getAiScore,
    isGameOver,
    getWinner,
    getGameResultDescription
  };
}