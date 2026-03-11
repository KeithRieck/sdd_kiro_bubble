/**
 * CollisionSystem
 * 
 * Handles collision detection and resolution between bubbles.
 * Uses circle-to-circle distance calculations for accurate collision detection.
 * 
 * Requirements: 3.1, 10.1, 10.2, 10.3
 */
class CollisionSystem {
  /**
   * Check collision between two bubbles using circle-to-circle distance
   * @param {PlayerBubble|AIBubble} bubble1 - First bubble
   * @param {AIBubble} bubble2 - Second bubble
   * @returns {boolean} True if colliding
   */
  static checkCollision(bubble1, bubble2) {
    const dx = bubble1.x - bubble2.x;
    const dy = bubble1.y - bubble2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = bubble1.getRadius() + bubble2.getRadius();
    return distance < minDistance;
  }

  /**
   * Process collision between player and AI bubble
   * @param {PlayerBubble} player - Player bubble
   * @param {AIBubble} aiBubble - AI bubble
   * @returns {Object} Result with action and data
   */
  static resolveCollision(player, aiBubble) {
    if (player.size > aiBubble.size) {
      return {
        action: 'consume',
        score: aiBubble.size,
        growth: Math.floor(Math.sqrt(aiBubble.size))
      };
    } else {
      return {
        action: 'death',
        score: 0,
        growth: 0
      };
    }
  }
}

export default CollisionSystem;
