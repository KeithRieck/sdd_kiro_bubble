import PlayerBubble from '../entities/PlayerBubble.js';
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
    this.currentBubbleCount = 10;  // Tracks bubble count across scene resets
    
    // Game entities and systems
    this.playerBubble = null;
    this.aiBubbles = [];
    this.spawnSystem = null;
    this.hud = null;
    this.sounds = {};
    this.gameWorldBackground = null;  // Black background for Game_World
    this.isPaused = false;  // Track pause state for scenario restart
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
    
    // Load sound effects
    this.sounds.pop = this.sound.add('pop');
    this.sounds.explosion = this.sound.add('explosion');
    this.sounds.fanfare = this.sound.add('fanfare');
    
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
    // Skip all updates if paused
    if (this.isPaused) {
      return;
    }
    
    // Update player bubble
    this.playerBubble.update(delta);

    // Update AI bubbles
    this.aiBubbles.forEach(bubble => bubble.update(delta));

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
   * Sets isPaused to true, waits 2 seconds, then resets player size to 30 and restarts scene
   */
  restartScenarioWithPause() {
    this.isPaused = true;
    
    // Wait 2 seconds before restarting
    this.time.delayedCall(2000, () => {
      this.isPaused = false;
      // Reset player bubble size to 30 pixels
      this.playerBubble.size = 30;
      this.scene.restart({ 
        bubbleCount: this.currentBubbleCount,
        lives: this.lives,
        score: this.score
      });
    });
  }

  /**
   * Handle game over state
   * Pauses scene and displays game over screen
   */
  handleGameOver() {
    this.scene.pause();
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
   */
  spawnInitialBubbles() {
    const targetCount = this.spawnSystem.getTargetCount();
    for (let i = 0; i < targetCount; i++) {
      const bubble = this.spawnSystem.spawnBubble(
        this.playerBubble.size,
        this.playerBubble.x,
        this.playerBubble.y,
        this.aiBubbles.length
      );
      if (bubble) {
        this.aiBubbles.push(bubble);
      }
    }
  }

  /**
   * Maintain target bubble count by spawning new bubbles as needed
   */
  maintainBubbleCount() {
    const targetCount = this.spawnSystem.getTargetCount();
    while (this.aiBubbles.length < targetCount) {
      const bubble = this.spawnSystem.spawnBubble(
        this.playerBubble.size,
        this.playerBubble.x,
        this.playerBubble.y,
        this.aiBubbles.length
      );
      if (bubble) {
        this.aiBubbles.push(bubble);
      }
    }
  }

  /**
   * Render all game entities
   */
  render() {
    // Render all AI bubbles
    this.aiBubbles.forEach(bubble => bubble.render());
    
    // Render player bubble
    this.playerBubble.render();
    
    // Update HUD
    this.hud.render(this.score, this.lives);
  }
}

export default GameScene;
