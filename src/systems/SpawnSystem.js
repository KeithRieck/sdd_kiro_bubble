/**
 * SpawnSystem - Manages AI bubble spawning with dynamic difficulty scaling
 * 
 * Handles spawning of AI bubbles with balanced size distribution and
 * progressive difficulty increases across scene resets.
 */

import AIBubble from '../entities/AIBubble.js';

class SpawnSystem {
  /**
   * Create a new SpawnSystem
   * @param {object} scene - Phaser scene reference
   * @param {number} worldWidth - Game world width in pixels
   * @param {number} worldHeight - Game world height in pixels
   * @param {number} initialBubbleCount - Initial target bubble count (default 10)
   */
  constructor(scene, worldWidth, worldHeight, initialBubbleCount = 10) {
    this.scene = scene;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.targetBubbleCount = initialBubbleCount;
  }

  /**
   * Increase target bubble count for next scene
   * Increments by 2 each time (progressive difficulty)
   */
  incrementDifficulty() {
    this.targetBubbleCount += 2;
  }

  /**
   * Get current target bubble count
   * @returns {number} Target number of bubbles for current scene
   */
  getTargetCount() {
    return this.targetBubbleCount;
  }

  /**
   * Calculate size range for new AI bubbles based on player size
   * @param {number} playerSize - Current player bubble size
   * @returns {Object} Min and max size values
   */
  calculateSizeRange(playerSize) {
    return {
      min: Math.max(10, Math.floor(playerSize * 0.5)),
      max: Math.min(70, Math.floor(playerSize * 1.5))
    };
  }

  /**
   * Generate size with balanced distribution
   * 30% smaller than player, 50% similar to player, 20% larger than player
   * @param {Object} sizeRange - Min and max size
   * @param {number} playerSize - Current player size
   * @returns {number} Generated size
   */
  generateBalancedSize(sizeRange, playerSize) {
    const roll = Math.random();
    let size;
    
    if (roll < 0.3) {
      // 30% smaller than player
      const range = playerSize - sizeRange.min;
      if (range <= 0) {
        size = sizeRange.min;
      } else {
        size = Math.floor(Math.random() * range + sizeRange.min);
      }
    } else if (roll < 0.8) {
      // 50% similar to player (within ±20% of player size)
      const variance = playerSize * 0.2;
      const min = Math.max(sizeRange.min, playerSize - variance);
      const max = Math.min(sizeRange.max, playerSize + variance);
      
      // Ensure min <= max
      if (min > max) {
        // If player size is near the upper bound, just use the valid range
        size = Math.floor(Math.random() * (sizeRange.max - sizeRange.min) + sizeRange.min);
      } else {
        size = Math.floor(Math.random() * (max - min) + min);
      }
    } else {
      // 20% larger than player
      const range = sizeRange.max - playerSize;
      if (range <= 0) {
        size = sizeRange.max;
      } else {
        size = Math.floor(Math.random() * range + playerSize);
      }
    }
    
    // Clamp to ensure we're within bounds (handles floating point edge cases)
    return Math.max(sizeRange.min, Math.min(sizeRange.max, size));
  }

  /**
   * Get random spawn position avoiding edges
   * @param {number} size - Bubble size
   * @returns {Object} x and y coordinates
   */
  getRandomPosition(size) {
    const margin = size / 2 + 10;
    return {
      x: margin + Math.random() * (this.worldWidth - margin * 2),
      y: margin + Math.random() * (this.worldHeight - margin * 2)
    };
  }

  /**
   * Get random velocity vector
   * @returns {Object} x and y velocity components
   */
  getRandomVelocity() {
    const speed = 50 + Math.random() * 100;  // 50-150 px/s
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
  }

  /**
   * Spawn a new AI bubble with balanced size distribution
   * @param {number} playerSize - Current player bubble size
   * @param {number} currentCount - Current number of AI bubbles
   * @returns {AIBubble|null} New bubble or null if at capacity
   */
  spawnBubble(playerSize, currentCount) {
    if (currentCount >= this.targetBubbleCount) {
      return null;
    }

    const sizeRange = this.calculateSizeRange(playerSize);
    const size = this.generateBalancedSize(sizeRange, playerSize);
    const position = this.getRandomPosition(size);
    const velocity = this.getRandomVelocity();

    return new AIBubble(
      this.scene,
      position.x,
      position.y,
      size,
      velocity.x,
      velocity.y
    );
  }
}

export default SpawnSystem;
