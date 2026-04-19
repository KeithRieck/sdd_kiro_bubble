import PlayerBubble from '../entities/PlayerBubble.js';
import ShrinkBubble from '../entities/ShrinkBubble.js';
import CollisionSystem from '../systems/CollisionSystem.js';
import SpawnSystem from '../systems/SpawnSystem.js';
import HUD from '../ui/HUD.js';

/**
 * GameScene - Main game scene that orchestrates all game systems
 * 
 * Manages game state, player bubble, AI bubbles, collisions, spawning,
 * input handling, and state transitions (death, win, game over).
 */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    
    // World dimensions
    this.worldWidth = 800;
    this.worldHeight = 600;
    
    // Game state
    this.lives = 3;
    this.score = 0;
    this.level = 1;
    this.currentBubbleCount = 10;  // Tracks bubble count across scene resets
    
    // Game entities and systems
    this.playerBubble = null;
    this.aiBubbles = [];
    this.shrinkBubbles = [];
    this.spawnSystem = null;
    this.hud = null;
    this.sounds = {};
    this.gameWorldBackground = null;  // Black background for Game_World
    this.gameWorldBorder = null;  // White border for Game_World
    this.isPaused = false;  // Track pause state for scenario restart
    this.isStopped = false;  // Track game over stopped state
  }

  /**
   * Initialize scene with data from previous scene restart
   * Preserves bubble count across scene restarts for progressive difficulty
   * @param {Object} data - Data passed from scene.restart()
   */
  init(data) {
    // Preserve bubble count across scene restarts
    if (data && data.bubbleCount !== undefined) {
      this.currentBubbleCount = data.bubbleCount;
    }
    
    // Reset lives and score for new scene
    this.lives = data && data.lives !== undefined ? data.lives : 3;
    this.score = data && data.score !== undefined ? data.score : 0;
    if (data && data.level !== undefined) {
      this.level = data.level;
    }
  }

  /**
   * Create game objects and initialize systems
   */
  create() {
    // Create black background for Game_World (800x600)
    this.gameWorldBackground = this.add.rectangle(
      0, 
      0, 
      this.worldWidth, 
      this.worldHeight, 
      0x000000  // Black (#000000)
    );
    this.gameWorldBackground.setOrigin(0, 0);
    
    // Create white 3-pixel border around Game_World (800x600 inner dimensions)
    this.gameWorldBorder = this.add.graphics();
    this.gameWorldBorder.lineStyle(3, 0xFFFFFF, 1);  // 3px white border
    this.gameWorldBorder.strokeRect(0, 0, this.worldWidth, this.worldHeight);
    
    // Load sound effects
    this.sounds.pop = this.sound.add('pop');
    this.sounds.explosion = this.sound.add('explosion');
    this.sounds.fanfare = this.sound.add('fanfare');
    this.sounds.shrink = this.sound.add('shrink');
    
    // Create player bubble at center
    this.playerBubble = new PlayerBubble(
      this,
      this.worldWidth / 2,
      this.worldHeight / 2,
      30
    );

    // Initialize spawn system with current bubble count
    this.spawnSystem = new SpawnSystem(
      this,
      this.worldWidth,
      this.worldHeight,
      this.currentBubbleCount
    );

    // Spawn initial AI bubbles
    this.spawnInitialBubbles();

    // Setup input handlers
    this.setupInput();

    // Create HUD
    this.hud = new HUD(this);
  }

  /**
   * Game loop - called every frame
   * @param {number} time - Total elapsed time in milliseconds
   * @param {number} delta - Time since last frame in milliseconds
   */
  update(time, delta) {
    // Skip all updates if paused or stopped
    if (this.isPaused || this.isStopped) {
      return;
    }
    
    // Update player bubble
    this.playerBubble.update(delta);

    // Update AI bubbles
    this.aiBubbles.forEach(bubble => bubble.update(delta));

    // Update shrink bubbles
    this.shrinkBubbles.forEach(bubble => bubble.update(delta));

    // Check collisions
    this.checkCollisions();

    // Maintain bubble count
    this.maintainBubbleCount();

    // Check win condition
    if (this.playerBubble.size >= 100) {
      this.handleWin();
    }

    // Render all entities
    this.render();
  }

  /**
   * Check for collisions between player and AI bubbles
   * Handles consumption and death based on size comparison
   */
  checkCollisions() {
    for (let i = this.aiBubbles.length - 1; i >= 0; i--) {
      const aiBubble = this.aiBubbles[i];
      
      if (CollisionSystem.checkCollision(this.playerBubble, aiBubble)) {
        const result = CollisionSystem.resolveCollision(
          this.playerBubble,
          aiBubble
        );
        
        if (result.action === 'consume') {
          // Player consumes smaller bubble
          this.score += result.score;
          this.playerBubble.grow(aiBubble.size);
          
          // Remove consumed bubble
          if (aiBubble.graphics) {
            aiBubble.graphics.destroy();
          }
          this.aiBubbles.splice(i, 1);
          
          // Play pop sound
          this.sounds.pop.play();
        } else if (result.action === 'death') {
          // Player collides with larger or equal bubble
          this.sounds.explosion.play();
          this.handleDeath();
          break;  // Stop checking collisions after death
        }
      }
    }

    // Check shrink bubble collisions
    for (let i = this.shrinkBubbles.length - 1; i >= 0; i--) {
      const shrinkBubble = this.shrinkBubbles[i];
      if (CollisionSystem.checkCollision(this.playerBubble, shrinkBubble)) {
        this.playerBubble.size = 30;
        if (shrinkBubble.graphics) {
          shrinkBubble.graphics.destroy();
        }
        this.shrinkBubbles.splice(i, 1);
        this.sounds.shrink.play();
      }
    }
  }

  /**
   * Handle player death
   * Decrements lives and either restarts scene or triggers game over
   */
  handleDeath() {
    this.lives--;
    
    if (this.lives > 0) {
      // Play fanfare and restart with increased difficulty
      this.sounds.fanfare.play();
      this.currentBubbleCount += 2;
      this.restartScenarioWithPause();
    } else {
      // Game over
      this.handleGameOver();
    }
  }

  /**
   * Handle win condition (player reaches size 100)
   * Restarts scene with increased difficulty
   */
  handleWin() {
    this.sounds.fanfare.play();
    this.currentBubbleCount += 2;
    this.restartScenarioWithPause();
  }

  /**
   * Restart scenario with 2-second pause and player size reset
   * Sets isPaused to true, waits 2 seconds, then resets player size to 30,
   * clears AI_Bubble list, spawns initial bubbles, and restarts scene
   */
  restartScenarioWithPause() {
    this.isPaused = true;
    
    // Wait 2 seconds before restarting
    this.time.delayedCall(2000, () => {
      this.isPaused = false;
      
      // Reset player bubble size to 30 pixels
      this.playerBubble.size = 30;
      
      // Clear AI_Bubble list before restart (destroy graphics)
      this.aiBubbles.forEach(bubble => {
        if (bubble.graphics) {
          bubble.graphics.destroy();
        }
      });
      this.aiBubbles = [];
      this.shrinkBubbles = [];
      
      // Spawn initial bubbles for new scenario
      this.spawnInitialBubbles();
      
      // Restart scene with updated state
      this.level++;
      this.scene.restart({ 
        bubbleCount: this.currentBubbleCount,
        lives: this.lives,
        score: this.score,
        level: this.level
      });
    });
  }

  /**
   * Stop the game on game over - disables updates and waits for restart click.
   * On click, restarts the scene completely from scratch with full initial state.
   */
  stopGame() {
    this.isStopped = true;
    this.input.removeAllListeners();
    this.input.once('pointerdown', () => {
      // Use scene.start() to fully reload the scene from scratch,
      // equivalent to the game being loaded for the first time.
      this.isStopped = false;
      this.scene.restart({ 
        bubbleCount: 10,
        lives: 3,
        score: 0,
        level: 1
      });
      // this.scene.start('GameScene');
    });
  }

  /**
   * Handle game over state
   * Stops scene and displays game over screen
   */
  handleGameOver() {
    this.stopGame();
    this.hud.showGameOver(this.score);
  }

  /**
   * Setup input handlers for mouse and touch
   */
  setupInput() {
    // Handle pointer move (continuous movement while held)
    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown) {
        this.playerBubble.setTarget(pointer.x, pointer.y);
      }
    });

    // Handle pointer down (initial click/touch)
    this.input.on('pointerdown', (pointer) => {
      this.playerBubble.setTarget(pointer.x, pointer.y);
    });
  }

  /**
   * Spawn initial AI bubbles up to target count
   * Clears AI_Bubble list first to ensure clean state
   */
  spawnInitialBubbles() {
    // Clear AI_Bubble list to ensure clean state
    this.aiBubbles.forEach(bubble => {
      if (bubble.graphics) {
        bubble.graphics.destroy();
      }
    });
    this.aiBubbles = [];
    this.shrinkBubbles = [];
    
    const targetCount = this.spawnSystem.getTargetCount();
    for (let i = 0; i < targetCount; i++) {
      const totalBubbles = this.aiBubbles.length + this.shrinkBubbles.length;
      const bubble = this.spawnSystem.spawnBubble(
        this.playerBubble.size,
        this.playerBubble.x,
        this.playerBubble.y,
        totalBubbles
      );
      if (bubble) {
        if (bubble.constructor.name === 'ShrinkBubble') {
          this.shrinkBubbles.push(bubble);
        } else {
          this.aiBubbles.push(bubble);
        }
      }
    }
  }

  /**
   * Maintain target bubble count by spawning new bubbles as needed
   */
  maintainBubbleCount() {
    const targetCount = this.spawnSystem.getTargetCount();
    while (this.aiBubbles.length + this.shrinkBubbles.length < targetCount) {
      const totalBubbles = this.aiBubbles.length + this.shrinkBubbles.length;
      const bubble = this.spawnSystem.spawnBubble(
        this.playerBubble.size,
        this.playerBubble.x,
        this.playerBubble.y,
        totalBubbles
      );
      if (bubble) {
        if (bubble.constructor.name === 'ShrinkBubble') {
          this.shrinkBubbles.push(bubble);
        } else {
          this.aiBubbles.push(bubble);
        }
      }
    }
  }

  /**
   * Render all game entities
   */
  render() {
    // Render all AI bubbles
    this.aiBubbles.forEach(bubble => bubble.render());

    // Render all shrink bubbles
    this.shrinkBubbles.forEach(bubble => bubble.render());
    
    // Render player bubble
    this.playerBubble.render();
    
    // Update HUD
    this.hud.render(this.score, this.lives, this.level);
  }
}

export default GameScene;
