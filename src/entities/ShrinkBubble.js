import Bubble from './Bubble.js';

/**
 * ShrinkBubble entity - a special red bubble that resets the player's size on collision.
 * Extends the Bubble base class with velocity-based movement and boundary bouncing.
 */
class ShrinkBubble extends Bubble {
  /**
   * Create a ShrinkBubble
   * @param {Phaser.Scene} scene - The Phaser scene this bubble belongs to
   * @param {number} x - Initial x position in pixels
   * @param {number} y - Initial y position in pixels
   * @param {number} velocityX - Horizontal velocity in pixels per second
   * @param {number} velocityY - Vertical velocity in pixels per second
   */
  constructor(scene, x, y, velocityX, velocityY) {
    super(scene, x, y, 20);  // Fixed size of 20 pixels
    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }

  /**
   * Update bubble position and handle boundary bouncing
   * @param {number} delta - Time since last frame in milliseconds
   */
  update(delta) {
    const dt = delta / 1000;
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;

    const radius = this.getRadius();
    if (this.x - radius < 0 || this.x + radius > 800) {
      this.velocityX *= -1;
      this.constrainToBounds(800, 600);
    }
    if (this.y - radius < 0 || this.y + radius > 600) {
      this.velocityY *= -1;
      this.constrainToBounds(800, 600);
    }
  }

  /**
   * Render the bubble as a red filled circle
   */
  render() {
    if (!this.graphics) {
      this.graphics = this.scene.add.graphics();
    }
    this.graphics.clear();
    this.graphics.fillStyle(0xFF0000, 1);
    this.graphics.fillCircle(this.x, this.y, this.getRadius());
  }
}

export default ShrinkBubble;
