import { describe, it, expect } from 'vitest';
import CollisionSystem from '../../../src/systems/CollisionSystem.js';

describe('CollisionSystem', () => {
  // Mock bubble objects for testing
  const createMockBubble = (x, y, size) => ({
    x,
    y,
    size,
    getRadius: () => size / 2
  });

  describe('checkCollision()', () => {
    it('should detect collision when bubbles overlap', () => {
      const bubble1 = createMockBubble(100, 100, 40);
      const bubble2 = createMockBubble(120, 100, 40);
      
      // Distance = 20, sum of radii = 40, so they collide
      const result = CollisionSystem.checkCollision(bubble1, bubble2);
      expect(result).toBe(true);
    });

    it('should not detect collision when bubbles are far apart', () => {
      const bubble1 = createMockBubble(100, 100, 40);
      const bubble2 = createMockBubble(200, 100, 40);
      
      // Distance = 100, sum of radii = 40, so no collision
      const result = CollisionSystem.checkCollision(bubble1, bubble2);
      expect(result).toBe(false);
    });

    it('should detect collision when bubbles are touching', () => {
      const bubble1 = createMockBubble(100, 100, 40);
      const bubble2 = createMockBubble(140, 100, 40);
      
      // Distance = 40, sum of radii = 40, so they are just touching
      // Since we use < instead of <=, this should NOT collide
      const result = CollisionSystem.checkCollision(bubble1, bubble2);
      expect(result).toBe(false);
    });

    it('should detect collision at exact boundary', () => {
      const bubble1 = createMockBubble(100, 100, 40);
      const bubble2 = createMockBubble(139, 100, 40);
      
      // Distance = 39, sum of radii = 40, so they collide
      const result = CollisionSystem.checkCollision(bubble1, bubble2);
      expect(result).toBe(true);
    });

    it('should handle diagonal collisions', () => {
      const bubble1 = createMockBubble(100, 100, 40);
      const bubble2 = createMockBubble(115, 115, 40);
      
      // Distance = sqrt(15^2 + 15^2) ≈ 21.2, sum of radii = 40
      const result = CollisionSystem.checkCollision(bubble1, bubble2);
      expect(result).toBe(true);
    });

    it('should handle different sized bubbles', () => {
      const bubble1 = createMockBubble(100, 100, 60);
      const bubble2 = createMockBubble(150, 100, 20);
      
      // Distance = 50, sum of radii = 30 + 10 = 40, so no collision
      const result = CollisionSystem.checkCollision(bubble1, bubble2);
      expect(result).toBe(false);
    });

    it('should detect collision with different sized bubbles when close', () => {
      const bubble1 = createMockBubble(100, 100, 60);
      const bubble2 = createMockBubble(135, 100, 20);
      
      // Distance = 35, sum of radii = 30 + 10 = 40, so they collide
      const result = CollisionSystem.checkCollision(bubble1, bubble2);
      expect(result).toBe(true);
    });

    it('should handle bubbles at same position', () => {
      const bubble1 = createMockBubble(100, 100, 40);
      const bubble2 = createMockBubble(100, 100, 40);
      
      // Distance = 0, sum of radii = 40, so they definitely collide
      const result = CollisionSystem.checkCollision(bubble1, bubble2);
      expect(result).toBe(true);
    });
  });

  describe('resolveCollision()', () => {
    it('should return consume action when player is larger', () => {
      const player = createMockBubble(100, 100, 50);
      const aiBubble = createMockBubble(120, 100, 30);
      
      const result = CollisionSystem.resolveCollision(player, aiBubble);
      
      expect(result.action).toBe('consume');
      expect(result.score).toBe(30); // AI bubble size
      expect(result.growth).toBe(Math.floor(Math.sqrt(30))); // floor(sqrt(30)) = 5
    });

    it('should return death action when AI is larger', () => {
      const player = createMockBubble(100, 100, 30);
      const aiBubble = createMockBubble(120, 100, 50);
      
      const result = CollisionSystem.resolveCollision(player, aiBubble);
      
      expect(result.action).toBe('death');
      expect(result.score).toBe(0);
      expect(result.growth).toBe(0);
    });

    it('should return death action when sizes are equal', () => {
      const player = createMockBubble(100, 100, 40);
      const aiBubble = createMockBubble(120, 100, 40);
      
      const result = CollisionSystem.resolveCollision(player, aiBubble);
      
      expect(result.action).toBe('death');
      expect(result.score).toBe(0);
      expect(result.growth).toBe(0);
    });

    it('should calculate correct growth value', () => {
      const player = createMockBubble(100, 100, 50);
      const aiBubble = createMockBubble(120, 100, 16);
      
      const result = CollisionSystem.resolveCollision(player, aiBubble);
      
      expect(result.action).toBe('consume');
      expect(result.growth).toBe(4); // floor(sqrt(16)) = 4
    });

    it('should calculate correct growth for large AI bubble', () => {
      const player = createMockBubble(100, 100, 70);
      const aiBubble = createMockBubble(120, 100, 64);
      
      const result = CollisionSystem.resolveCollision(player, aiBubble);
      
      expect(result.action).toBe('consume');
      expect(result.growth).toBe(8); // floor(sqrt(64)) = 8
    });

    it('should handle edge case where player is just 1 pixel larger', () => {
      const player = createMockBubble(100, 100, 31);
      const aiBubble = createMockBubble(120, 100, 30);
      
      const result = CollisionSystem.resolveCollision(player, aiBubble);
      
      expect(result.action).toBe('consume');
      expect(result.score).toBe(30);
    });

    it('should handle edge case where AI is just 1 pixel larger', () => {
      const player = createMockBubble(100, 100, 30);
      const aiBubble = createMockBubble(120, 100, 31);
      
      const result = CollisionSystem.resolveCollision(player, aiBubble);
      
      expect(result.action).toBe('death');
    });

    it('should return score equal to AI bubble size on consumption', () => {
      const player = createMockBubble(100, 100, 60);
      const aiBubble = createMockBubble(120, 100, 45);
      
      const result = CollisionSystem.resolveCollision(player, aiBubble);
      
      expect(result.score).toBe(45);
    });

    it('should handle very small AI bubble', () => {
      const player = createMockBubble(100, 100, 30);
      const aiBubble = createMockBubble(120, 100, 10);
      
      const result = CollisionSystem.resolveCollision(player, aiBubble);
      
      expect(result.action).toBe('consume');
      expect(result.score).toBe(10);
      expect(result.growth).toBe(3); // floor(sqrt(10)) = 3
    });

    it('should handle very large AI bubble', () => {
      const player = createMockBubble(100, 100, 100);
      const aiBubble = createMockBubble(120, 100, 70);
      
      const result = CollisionSystem.resolveCollision(player, aiBubble);
      
      expect(result.action).toBe('consume');
      expect(result.score).toBe(70);
      expect(result.growth).toBe(8); // floor(sqrt(70)) = 8
    });
  });
});
