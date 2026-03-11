import Bubble from './Bubble.js';

/**
 * Player-controlled bubble entity.
 * Extends Bubble base class with movement targeting and speed calculation.
 */
class PlayerBubble extends Bubble {
  /**
   * Create a player bubble
   * @param {Phaser.Scene} scene - The Phaser scene this bubble belongs to
   * @param {number} x - Initial x position in pixels
   * @param {number} y - Initial y position in pixels
   * @param {number} size - Diameter of the bubble in pixels (default: 30)
   */
  constructor(scene, x, y, size = 30) {
    super(scene, x, y, size);
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Calculate movement speed based on size (inversely proportional)
   * Larger bubbles move slower than smaller bubbles
   * @returns {number} Speed in pixels per second
   */
  getSpeed() {
    return Math.max(50, 300 - (this.size * 2));
  }

  /**
   * Update position toward target, constrained by boundaries
   * @param {number} delta - Time since last frame in milliseconds
   */
  update(delta) {
    // Convert delta from milliseconds to seconds
    const dt = delta / 1000;

    // Calculate direction vector to target
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only move if we're not already at the target (within 1 pixel)
    if (distance > 1) {
      const speed = this.getSpeed();
      const moveDistance = speed * dt;

      // Calculate movement ratio (don't overshoot the target)
      const ratio = Math.min(moveDistance / distance, 1);

      // Apply movement
      this.x += dx * ratio;
      this.y += dy * ratio;

      // Constrain to world boundaries (800x600)
      this.constrainToBounds(800, 600);
    }
  }

  /**
   * Set movement target from input
   * @param {number} x - Target x coordinate
   * @param {number} y - Target y coordinate
   */
  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }
  /**
   * Grow bubble by consuming another bubble
   * Growth is calculated as the integer square root of the consumed bubble's size
   * Size is capped at 100 pixels maximum
   * @param {number} consumedSize - Size of the consumed bubble in pixels
   */
  grow(consumedSize) {
    const growth = Math.floor(Math.sqrt(consumedSize));
    this.size = Math.min(100, this.size + growth);
  }

  /**
   * Render the player bubble as a gray circle with blue border
   * Validates: Requirements 5.2
   */
  render() {
    // Create graphics object if it doesn't exist
    if (!this.graphics) {
      this.graphics = this.scene.add.graphics();
    }

    // Clear previous frame
    this.graphics.clear();

    // Draw gray circle fill (0x808080)
    this.graphics.fillStyle(0x808080, 1);
    this.graphics.fillCircle(this.x, this.y, this.getRadius());

    // Draw blue border (0x4a90e2, 2px width)
    this.graphics.lineStyle(2, 0x4a90e2, 1);
    this.graphics.strokeCircle(this.x, this.y, this.getRadius());
  }
}

export default PlayerBubble;
