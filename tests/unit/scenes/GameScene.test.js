import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameScene from '../../../src/scenes/GameScene.js';
import PlayerBubble from '../../../src/entities/PlayerBubble.js';
import AIBubble from '../../../src/entities/AIBubble.js';

describe('GameScene', () => {
  let gameScene;
  let mockSound;
  let mockAdd;
  let mockInput;
  let mockTime;
  let mockSceneManager;

  beforeEach(() => {
    // Mock sound system
    mockSound = {
      add: vi.fn((key) => ({
        play: vi.fn()
      }))
    };

    // Mock add system for creating game objects
    mockAdd = {
      graphics: vi.fn(() => ({
        clear: vi.fn(),
        fillStyle: vi.fn(),
        fillCircle: vi.fn(),
        lineStyle: vi.fn(),
        strokeCircle: vi.fn(),
        destroy: vi.fn()
      })),
      text: vi.fn(() => ({
        setText: vi.fn(),
        setOrigin: vi.fn()
      }))
    };

    // Mock input system
    mockInput = {
      on: vi.fn(),
      once: vi.fn()
    };

    // Mock time system
    mockTime = {
      delayedCall: vi.fn((delay, callback) => callback())
    };

    // Mock scene manager
    mockSceneManager = {
      restart: vi.fn(),
      pause: vi.fn()
    };

    // Create scene instance
    gameScene = new GameScene();
    gameScene.sound = mockSound;
    gameScene.add = mockAdd;
    gameScene.input = mockInput;
    gameScene.time = mockTime;
    gameScene.scene = mockSceneManager;
  });

  describe('Constructor', () => {
    it('should initialize with correct default values', () => {
      expect(gameScene.worldWidth).toBe(800);
      expect(gameScene.worldHeight).toBe(600);
      expect(gameScene.lives).toBe(3);
      expect(gameScene.score).toBe(0);
      expect(gameScene.currentBubbleCount).toBe(10);
      expect(gameScene.aiBubbles).toEqual([]);
    });

    it('should have the correct scene key', () => {
      const config = gameScene.sys?.settings || { key: 'GameScene' };
      expect(config.key).toBe('GameScene');
    });

    it('should be a Phaser Scene', () => {
      expect(gameScene).toBeInstanceOf(Phaser.Scene);
    });
  });

  describe('init()', () => {
    it('should preserve bubble count from data', () => {
      gameScene.init({ bubbleCount: 14 });
      expect(gameScene.currentBubbleCount).toBe(14);
    });

    it('should preserve lives from data', () => {
      gameScene.init({ lives: 2 });
      expect(gameScene.lives).toBe(2);
    });

    it('should preserve score from data', () => {
      gameScene.init({ score: 100 });
      expect(gameScene.score).toBe(100);
    });

    it('should use default values when no data provided', () => {
      gameScene.init({});
      expect(gameScene.lives).toBe(3);
      expect(gameScene.score).toBe(0);
    });
  });

  describe('create()', () => {
    it('should load sound effects', () => {
      gameScene.create();
      
      expect(mockSound.add).toHaveBeenCalledWith('pop');
      expect(mockSound.add).toHaveBeenCalledWith('explosion');
      expect(mockSound.add).toHaveBeenCalledWith('fanfare');
    });

    it('should create player bubble at center', () => {
      gameScene.create();
      
      expect(gameScene.playerBubble).toBeInstanceOf(PlayerBubble);
      expect(gameScene.playerBubble.x).toBe(400);
      expect(gameScene.playerBubble.y).toBe(300);
      expect(gameScene.playerBubble.size).toBe(30);
    });

    it('should initialize spawn system', () => {
      gameScene.create();
      
      expect(gameScene.spawnSystem).toBeDefined();
      expect(gameScene.spawnSystem.getTargetCount()).toBe(10);
    });

    it('should spawn initial AI bubbles', () => {
      gameScene.create();
      
      expect(gameScene.aiBubbles.length).toBe(10);
      gameScene.aiBubbles.forEach(bubble => {
        expect(bubble).toBeInstanceOf(AIBubble);
      });
    });

    it('should setup input handlers', () => {
      gameScene.create();
      
      expect(mockInput.on).toHaveBeenCalledWith('pointermove', expect.any(Function));
      expect(mockInput.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    });

    it('should create HUD', () => {
      gameScene.create();
      
      expect(gameScene.hud).toBeDefined();
    });
  });

  describe('setupInput()', () => {
    it('should set player target on pointerdown', () => {
      gameScene.create();
      
      const pointerdownHandler = mockInput.on.mock.calls.find(
        call => call[0] === 'pointerdown'
      )[1];
      
      const mockPointer = { x: 100, y: 200, isDown: true };
      pointerdownHandler(mockPointer);
      
      expect(gameScene.playerBubble.targetX).toBe(100);
      expect(gameScene.playerBubble.targetY).toBe(200);
    });

    it('should set player target on pointermove when pointer is down', () => {
      gameScene.create();
      
      const pointermoveHandler = mockInput.on.mock.calls.find(
        call => call[0] === 'pointermove'
      )[1];
      
      const mockPointer = { x: 150, y: 250, isDown: true };
      pointermoveHandler(mockPointer);
      
      expect(gameScene.playerBubble.targetX).toBe(150);
      expect(gameScene.playerBubble.targetY).toBe(250);
    });

    it('should not set player target on pointermove when pointer is up', () => {
      gameScene.create();
      
      const pointermoveHandler = mockInput.on.mock.calls.find(
        call => call[0] === 'pointermove'
      )[1];
      
      gameScene.playerBubble.targetX = 100;
      gameScene.playerBubble.targetY = 100;
      
      const mockPointer = { x: 150, y: 250, isDown: false };
      pointermoveHandler(mockPointer);
      
      expect(gameScene.playerBubble.targetX).toBe(100);
      expect(gameScene.playerBubble.targetY).toBe(100);
    });
  });

  describe('update()', () => {
    beforeEach(() => {
      gameScene.create();
    });

    it('should update player bubble', () => {
      const updateSpy = vi.spyOn(gameScene.playerBubble, 'update');
      gameScene.update(0, 16);
      
      expect(updateSpy).toHaveBeenCalledWith(16);
    });

    it('should update all AI bubbles', () => {
      const updateSpies = gameScene.aiBubbles.map(bubble => 
        vi.spyOn(bubble, 'update')
      );
      
      gameScene.update(0, 16);
      
      updateSpies.forEach(spy => {
        expect(spy).toHaveBeenCalledWith(16);
      });
    });

    it('should check for win condition', () => {
      gameScene.playerBubble.size = 100;
      const handleWinSpy = vi.spyOn(gameScene, 'handleWin');
      
      gameScene.update(0, 16);
      
      expect(handleWinSpy).toHaveBeenCalled();
    });
  });

  describe('checkCollisions()', () => {
    beforeEach(() => {
      gameScene.create();
    });

    it('should handle consumption when player is larger', () => {
      gameScene.playerBubble.size = 50;
      gameScene.playerBubble.x = 100;
      gameScene.playerBubble.y = 100;
      
      const smallBubble = gameScene.aiBubbles[0];
      smallBubble.size = 20;
      smallBubble.x = 100;
      smallBubble.y = 100;
      
      const initialScore = gameScene.score;
      const initialBubbleCount = gameScene.aiBubbles.length;
      
      gameScene.checkCollisions();
      
      expect(gameScene.score).toBeGreaterThan(initialScore);
      expect(gameScene.aiBubbles.length).toBe(initialBubbleCount - 1);
      expect(gameScene.sounds.pop.play).toHaveBeenCalled();
    });

    it('should handle death when AI bubble is larger or equal', () => {
      gameScene.playerBubble.size = 30;
      gameScene.playerBubble.x = 100;
      gameScene.playerBubble.y = 100;
      
      const largeBubble = gameScene.aiBubbles[0];
      largeBubble.size = 50;
      largeBubble.x = 100;
      largeBubble.y = 100;
      
      const handleDeathSpy = vi.spyOn(gameScene, 'handleDeath');
      
      gameScene.checkCollisions();
      
      expect(gameScene.sounds.explosion.play).toHaveBeenCalled();
      expect(handleDeathSpy).toHaveBeenCalled();
    });
  });

  describe('handleDeath()', () => {
    beforeEach(() => {
      gameScene.create();
    });

    it('should decrement lives', () => {
      const initialLives = gameScene.lives;
      gameScene.handleDeath();
      
      expect(gameScene.lives).toBe(initialLives - 1);
    });

    it('should restart scene with increased difficulty when lives remain', () => {
      gameScene.lives = 2;
      gameScene.handleDeath();
      
      expect(gameScene.sounds.fanfare.play).toHaveBeenCalled();
      expect(gameScene.currentBubbleCount).toBe(12);
      expect(mockSceneManager.restart).toHaveBeenCalledWith({
        bubbleCount: 12,
        lives: 1,
        score: 0
      });
    });

    it('should trigger game over when no lives remain', () => {
      gameScene.lives = 1;
      const handleGameOverSpy = vi.spyOn(gameScene, 'handleGameOver');
      
      gameScene.handleDeath();
      
      expect(handleGameOverSpy).toHaveBeenCalled();
    });
  });

  describe('handleWin()', () => {
    beforeEach(() => {
      gameScene.create();
    });

    it('should play fanfare sound', () => {
      gameScene.handleWin();
      
      expect(gameScene.sounds.fanfare.play).toHaveBeenCalled();
    });

    it('should increase bubble count by 2', () => {
      const initialCount = gameScene.currentBubbleCount;
      gameScene.handleWin();
      
      expect(gameScene.currentBubbleCount).toBe(initialCount + 2);
    });

    it('should restart scene with increased difficulty', () => {
      gameScene.handleWin();
      
      expect(mockSceneManager.restart).toHaveBeenCalledWith({
        bubbleCount: 12,
        lives: 3,
        score: 0
      });
    });
  });

  describe('handleGameOver()', () => {
    beforeEach(() => {
      gameScene.create();
    });

    it('should pause the scene', () => {
      gameScene.handleGameOver();
      
      expect(mockSceneManager.pause).toHaveBeenCalled();
    });

    it('should show game over screen via HUD', () => {
      const showGameOverSpy = vi.spyOn(gameScene.hud, 'showGameOver');
      gameScene.score = 150;
      
      gameScene.handleGameOver();
      
      expect(showGameOverSpy).toHaveBeenCalledWith(150);
    });
  });

  describe('maintainBubbleCount()', () => {
    beforeEach(() => {
      gameScene.create();
    });

    it('should spawn new bubbles when below target count', () => {
      // Remove some bubbles
      gameScene.aiBubbles.splice(0, 3);
      expect(gameScene.aiBubbles.length).toBe(7);
      
      gameScene.maintainBubbleCount();
      
      expect(gameScene.aiBubbles.length).toBe(10);
    });

    it('should not spawn bubbles when at target count', () => {
      expect(gameScene.aiBubbles.length).toBe(10);
      
      gameScene.maintainBubbleCount();
      
      expect(gameScene.aiBubbles.length).toBe(10);
    });
  });

  describe('render()', () => {
    beforeEach(() => {
      gameScene.create();
    });

    it('should render all AI bubbles', () => {
      const renderSpies = gameScene.aiBubbles.map(bubble => 
        vi.spyOn(bubble, 'render')
      );
      
      gameScene.render();
      
      renderSpies.forEach(spy => {
        expect(spy).toHaveBeenCalled();
      });
    });

    it('should render player bubble', () => {
      const renderSpy = vi.spyOn(gameScene.playerBubble, 'render');
      
      gameScene.render();
      
      expect(renderSpy).toHaveBeenCalled();
    });

    it('should update HUD', () => {
      const renderSpy = vi.spyOn(gameScene.hud, 'render');
      gameScene.score = 50;
      gameScene.lives = 2;
      
      gameScene.render();
      
      expect(renderSpy).toHaveBeenCalledWith(50, 2);
    });
  });
});
