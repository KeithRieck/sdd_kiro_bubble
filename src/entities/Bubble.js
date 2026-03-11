/**
 * Abstract base class for all bubble entities in the game.
 * Provides common functionality for position, size, and boundary constraints.
 */
class Bubble {
  /**
   * Create a bubble
   * @param {Phaser.Scene} scene - The Phaser scene this bubble belongs to
   * @param {number} x - Initial x position in pixels
   * @param {number} y - Initial y position in pixels
   * @param {number} size - Diameter of the bubble in pixels
   * @throws {Error} If instantiated directly (abstract class)
   */
  constructor(scene, x, y, size) {
    // Prevent direct instantiation of abstract class
    if (new.target === Bubble) {
      throw new Error('Bubble is an abstract class and cannot be instantiated directly');
    }
    
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.size = size;  // diameter in pixels
    this.graphics = null;  // Phaser Graphics object for rendering
  }

  /**
   * Get the radius of the bubble for collision detection
   * @returns {number} Radius in pixels (half of size)
   */
  getRadius() {
    return this.size / 2;
  }

  /**
   * Check if a position is within world boundaries
   * @param {number} x - X coordinate to check
   * @param {number} y - Y coordinate to check
   * @param {number} worldWidth - Width of the game world
   * @param {number} worldHeight - Height of the game world
   * @returns {boolean} True if position is within boundaries
   */
  isWithinBounds(x, y, worldWidth, worldHeight) {
    const radius = this.getRadius();
    return x - radius >= 0 && 
           x + radius <= worldWidth && 
           y - radius >= 0 && 
           y + radius <= worldHeight;
  }

  /**
   * Constrain the bubble's position to world boundaries
   * Adjusts x and y to ensure the bubble stays within bounds
   * @param {number} worldWidth - Width of the game world
   * @param {number} worldHeight - Height of the game world
   */
  constrainToBounds(worldWidth, worldHeight) {
    const radius = this.getRadius();
    this.x = Math.max(radius, Math.min(worldWidth - radius, this.x));
    this.y = Math.max(radius, Math.min(worldHeight - radius, this.y));
  }

  /**
   * Update bubble state (must be implemented by subclasses)
   * @param {number} delta - Time since last frame in milliseconds
   * @throws {Error} If not implemented by subclass
   */
  update(delta) {
    throw new Error('update() must be implemented by subclass');
  }

  /**
   * Render the bubble (must be implemented by subclasses)
   * @throws {Error} If not implemented by subclass
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }
}

export default Bubble;
