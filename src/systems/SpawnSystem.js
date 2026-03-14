/**
 * SpawnSystem - Manages AI bubble spawning with dynamic difficulty scaling
 * 
 * Handles spawning of AI bubbles with balanced size distribution and
 * progressive difficulty increases across scene resets.
 */

import AIBubble from '../entities/AIBubble.js';
import ShrinkBubble from '../entities/ShrinkBubble.js';

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
      // 30% chance: size < playerSize
      // Generate from sizeRange.min to playerSize-1
      const maxSize = playerSize - 1;
      if (maxSize < sizeRange.min) {
        // Edge case: playerSize is at or below min, use min
        size = sizeRange.min;
      } else {
        const range = maxSize - sizeRange.min + 1;
        size = Math.floor(Math.random() * range + sizeRange.min);
      }
    } else if (roll < 0.8) {
      // 50% chance: size ≈ playerSize
      // Generate within ±20% of playerSize, but ensure it's close
      const variance = Math.max(1, Math.floor(playerSize * 0.2));
      const min = Math.max(sizeRange.min, playerSize - variance);
      const max = Math.min(sizeRange.max, playerSize + variance);
      
      const range = max - min + 1;
      size = Math.floor(Math.random() * range + min);
    } else {
      // 20% chance: size > playerSize
      // Generate from playerSize+1 to sizeRange.max
      const minSize = playerSize + 1;
      if (minSize > sizeRange.max) {
        // Edge case: playerSize is at or above max, use max
        size = sizeRange.max;
      } else {
        const range = sizeRange.max - minSize + 1;
        size = Math.floor(Math.random() * range + minSize);
      }
    }
    
    // Clamp to ensure we're within bounds (handles floating point edge cases)
    return Math.max(sizeRange.min, Math.min(sizeRange.max, size));
  }

  /**
   * Get random spawn position avoiding edges and player bubble
   * @param {number} size - Bubble size
   * @param {number} playerX - Player bubble X position
   * @param {number} playerY - Player bubble Y position
   * @returns {Object} x and y coordinates
   */
  getRandomPosition(size, playerX, playerY) {
    const margin = size / 2 + 10;
    const minDistanceFromPlayer = 200;  // Minimum 200 pixels from player center
    let x, y, distance;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      x = margin + Math.random() * (this.worldWidth - margin * 2);
      y = margin + Math.random() * (this.worldHeight - margin * 2);
      const dx = x - playerX;
      const dy = y - playerY;
      distance = Math.sqrt(dx * dx + dy * dy);
      attempts++;
    } while (distance < minDistanceFromPlayer && attempts < maxAttempts);
    
    return { x, y };
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
   * @param {number} playerX - Player bubble X position
   * @param {number} playerY - Player bubble Y position
   * @param {number} currentCount - Current number of AI bubbles
   * @returns {AIBubble|null} New bubble or null if at capacity
   */
  spawnBubble(playerSize, playerX, playerY, currentCount) {
    if (currentCount >= this.targetBubbleCount) {
      return null;
    }

    // 10% chance to spawn a ShrinkBubble instead of an AIBubble
    if (Math.random() < 0.1) {
      const position = this.getRandomPosition(20, playerX, playerY);
      const velocity = this.getRandomVelocity();
      return new ShrinkBubble(this.scene, position.x, position.y, velocity.x, velocity.y);
    }

    const sizeRange = this.calculateSizeRange(playerSize);
    const size = this.generateBalancedSize(sizeRange, playerSize);
    const position = this.getRandomPosition(size, playerX, playerY);
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
