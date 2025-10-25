import React, { useEffect, useRef, useState } from 'react';
import { Application, Graphics, Text, TextStyle } from 'pixi.js';
import SettingsMenu, { type GameSettings } from './SettingsMenu';
import GameStats from './GameStats';
import { themes } from '../utils/themes';

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  width?: number;
  height?: number;
  gridSize?: number;
}

const SnakeGame: React.FC<SnakeGameProps> = ({
  width = 600,
  height = 600,
  gridSize = 20
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    speed: 1,
    gridSize: 20,
    theme: 'dark',
    showGrid: true,
    soundEnabled: false
  });

  // Game Statistics
  const [gameStats] = useState({
    highScore: parseInt(localStorage.getItem('snakeHighScore') || '0'),
    gamesPlayed: parseInt(localStorage.getItem('snakeGamesPlayed') || '0'),
    bestStreak: parseInt(localStorage.getItem('snakeBestStreak') || '0'),
    currentStreak: 0
  });

  const gameStateRef = useRef({
    snake: [{ x: 10, y: 10 }] as Position[],
    direction: { x: 1, y: 0 },
    food: { x: 15, y: 15 } as Position,
    score: 0,
    gameOver: false,
    gameStarted: false,
    gamePaused: false,
    lastMoveTime: 0,
    moveInterval: 500 // milliseconds between moves
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create PixiJS application
    const app = new Application();
    appRef.current = app;

    let gameCleanup: (() => void) | undefined;

    const currentTheme = themes[settings.theme];

    app.init({
      width,
      height,
      backgroundColor: currentTheme.backgroundColor,
      canvas: canvasRef.current,
    }).then(() => {
      // Ensure the app is fully initialized before setting up the game
      if (app.stage) {
        gameCleanup = setupGame();
      }
    }).catch((error) => {
      console.error('Failed to initialize PixiJS:', error);
    });

    return () => {
      // Clean up game resources first
      if (gameCleanup) {
        gameCleanup();
      }

      if (appRef.current) {
        try {
          // Clean up the PixiJS application properly
          if (appRef.current.stage) {
            appRef.current.stage.destroy();
          }
          appRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying PixiJS app:', error);
        }
        appRef.current = null;
      }
    };
  }, []);

  const setupGame = () => {
    if (!appRef.current || !appRef.current.stage) return;

    const app = appRef.current;
    const gameState = gameStateRef.current;
    const currentTheme = themes[settings.theme];

    // Create game board
    const board = new Graphics();
    board.rect(0, 0, width, height);
    board.stroke({ color: 0x333333, width: 2 });
    app.stage.addChild(board);

    // Create score text
    const scoreText = new Text({
      text: `Score: ${gameState.score}`,
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
      }),
    });
    scoreText.x = 10;
    scoreText.y = 10;
    app.stage.addChild(scoreText);

    // Create game over text
    const gameOverText = new Text({
      text: 'GAME OVER\nPress R to restart',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0xff0000,
        align: 'center',
      }),
    });
    gameOverText.x = width / 2 - 100;
    gameOverText.y = height / 2 - 50;
    gameOverText.visible = false;
    app.stage.addChild(gameOverText);

    // Create start text
    const startText = new Text({
      text: 'Press SPACE to start',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center',
      }),
    });
    startText.x = width / 2 - 100;
    startText.y = height / 2;
    app.stage.addChild(startText);

    // Create pause text
    const pauseText = new Text({
      text: 'PAUSED\nPress SPACE to resume',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 28,
        fill: 0xffff00,
        align: 'center',
      }),
    });
    pauseText.x = width / 2 - 120;
    pauseText.y = height / 2 - 30;
    pauseText.visible = false;
    app.stage.addChild(pauseText);

    // Game loop
    const gameLoop = (currentTime: number) => {
      if (!gameState.gameOver && gameState.gameStarted && !gameState.gamePaused) {
        // Only move snake at specified intervals
        if (currentTime - gameState.lastMoveTime >= gameState.moveInterval) {
          updateSnake();
          checkCollisions();
          checkFoodCollision();
          gameState.lastMoveTime = currentTime;
        }
      }
      render();
      requestAnimationFrame(gameLoop);
    };

    const updateSnake = () => {
      const head = { ...gameState.snake[0] };
      head.x += gameState.direction.x;
      head.y += gameState.direction.y;

      // Wrap around walls instead of dying
      if (head.x < 0) head.x = (width / gridSize) - 1;
      if (head.x >= width / gridSize) head.x = 0;
      if (head.y < 0) head.y = (height / gridSize) - 1;
      if (head.y >= height / gridSize) head.y = 0;

      gameState.snake.unshift(head);

      // Check if food was eaten
      if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        spawnFood();
        scoreText.text = `Score: ${gameState.score}`;
        // Slightly increase speed as score increases
        gameState.moveInterval = Math.max(100, 200 - (gameState.score * 2));
      } else {
        gameState.snake.pop();
      }
    };

    const checkCollisions = () => {
      const head = gameState.snake[0];

      // Only check for self collision (snake hitting itself)
      for (let i = 1; i < gameState.snake.length; i++) {
        if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
          gameOver();
          return;
        }
      }
    };

    const checkFoodCollision = () => {
      // This is handled in updateSnake
    };

    const spawnFood = () => {
      let newFood: Position = { x: 0, y: 0 };
      do {
        newFood = {
          x: Math.floor(Math.random() * (width / gridSize)),
          y: Math.floor(Math.random() * (height / gridSize))
        };
      } while (gameState.snake.some((segment: Position) =>
        segment.x === newFood.x && segment.y === newFood.y
      ));

      gameState.food = newFood;
    };

    const gameOver = () => {
      gameState.gameOver = true;
      gameOverText.visible = true;
    };

    const render = () => {
      // Clear previous frame
      app.stage.children.forEach(child => {
        if (child !== board && child !== scoreText && child !== gameOverText && child !== startText && child !== pauseText) {
          app.stage.removeChild(child);
        }
      });

      // Draw snake
      gameState.snake.forEach((segment, index) => {
        const snakeSegment = new Graphics();
        const color = index === 0 ? currentTheme.snakeHeadColor : currentTheme.snakeBodyColor;
        snakeSegment.rect(
          segment.x * settings.gridSize + 1,
          segment.y * settings.gridSize + 1,
          settings.gridSize - 2,
          settings.gridSize - 2
        );
        snakeSegment.fill(color);
        app.stage.addChild(snakeSegment);
      });

      // Draw food
      const food = new Graphics();
      food.rect(
        gameState.food.x * settings.gridSize + 2,
        gameState.food.y * settings.gridSize + 2,
        settings.gridSize - 4,
        settings.gridSize - 4
      );
      food.fill(currentTheme.foodColor);
      app.stage.addChild(food);
    };

    // Keyboard controls
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameOver && event.key.toLowerCase() === 'r') {
        restartGame();
        return;
      }

      // Handle pause/resume
      if (event.code === 'Space') {
        if (!gameState.gameStarted) {
          gameState.gameStarted = true;
          startText.visible = false;
          return;
        } else if (gameState.gameStarted && !gameState.gameOver) {
          gameState.gamePaused = !gameState.gamePaused;
          pauseText.visible = gameState.gamePaused;
          return;
        }
      }

      // Handle pause key (P key)
      if (event.key.toLowerCase() === 'p' && gameState.gameStarted && !gameState.gameOver) {
        gameState.gamePaused = !gameState.gamePaused;
        pauseText.visible = gameState.gamePaused;
        return;
      }

      if (!gameState.gameStarted || gameState.gamePaused) return;

      switch (event.key) {
        case 'ArrowUp':
          if (gameState.direction.y === 0) {
            gameState.direction = { x: 0, y: -1 };
          }
          break;
        case 'ArrowDown':
          if (gameState.direction.y === 0) {
            gameState.direction = { x: 0, y: 1 };
          }
          break;
        case 'ArrowLeft':
          if (gameState.direction.x === 0) {
            gameState.direction = { x: -1, y: 0 };
          }
          break;
        case 'ArrowRight':
          if (gameState.direction.x === 0) {
            gameState.direction = { x: 1, y: 0 };
          }
          break;
      }
    };

    const restartGame = () => {
      gameState.snake = [{ x: 10, y: 10 }];
      gameState.direction = { x: 1, y: 0 };
      gameState.food = { x: 15, y: 15 };
      gameState.score = 0;
      gameState.gameOver = false;
      gameState.gameStarted = false;
      gameState.gamePaused = false;
      gameState.lastMoveTime = 0;
      gameState.moveInterval = 1000; // Reset to initial speed
      scoreText.text = `Score: ${gameState.score}`;
      gameOverText.visible = false;
      pauseText.visible = false;
      startText.visible = true;
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyPress);

    // Start game loop
    gameLoop(0);

    // Store cleanup function for later use
    const cleanup = () => {
      window.removeEventListener('keydown', handleKeyPress);
    };

    // Return cleanup function
    return cleanup;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center gap-6 p-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-2 bg-linear-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Snake Game
        </h1>
        <p className="text-gray-400">Classic arcade fun with modern UI</p>
      </div>

      {/* Main Game Area */}
      <div className="flex gap-6 items-start">
        {/* Game Canvas */}
        <div className="flex flex-col items-center">
          <div className="border-2 border-gray-600 rounded-lg overflow-hidden shadow-2xl">
            <canvas ref={canvasRef} />
          </div>

          {/* Game Controls */}
          <div className="mt-4 text-white text-center max-w-md">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-green-400 mb-1">Movement</p>
                <p>Arrow Keys</p>
              </div>
              <div>
                <p className="font-semibold text-blue-400 mb-1">Controls</p>
                <p>SPACE: Start/Pause</p>
                <p>P: Pause | R: Restart</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-4 w-80">
          {/* Control Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              ⚙️ Settings
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              📊 Stats
            </button>
          </div>

          {/* Game Statistics */}
          {showStats && (
            <GameStats
              score={gameStateRef.current.score}
              highScore={gameStats.highScore}
              gamesPlayed={gameStats.gamesPlayed}
              bestStreak={gameStats.bestStreak}
              currentStreak={gameStats.currentStreak}
            />
          )}

          {/* Quick Info */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <h3 className="text-lg font-bold text-white mb-3">Quick Tips</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Snake wraps around edges</li>
              <li>• Only dies when hitting itself</li>
              <li>• Speed increases with score</li>
              <li>• Try different themes!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsMenu
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={setSettings}
        currentSettings={settings}
      />
    </div>
  );
};

export default SnakeGame;
