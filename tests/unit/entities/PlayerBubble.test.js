import { describe, it, expect } from 'vitest';
import PlayerBubble from '../../../src/entities/PlayerBubble.js';

describe('PlayerBubble', () => {
  const mockScene = {};

  describe('Constructor', () => {
    it('should initialize with default size of 30', () => {
      const bubble = new PlayerBubble(mockScene, 400, 300);
      expect(bubble.size).toBe(30);
      expect(bubble.x).toBe(400);
      expect(bubble.y).toBe(300);
      expect(bubble.targetX).toBe(400);
      expect(bubble.targetY).toBe(300);
    });

    it('should initialize with custom size', () => {
      const bubble = new PlayerBubble(mockScene, 400, 300, 50);
      expect(bubble.size).toBe(50);
    });
  });

  describe('getSpeed()', () => {
    it('should return speed inversely proportional to size', () => {
      const smallBubble = new PlayerBubble(mockScene, 400, 300, 30);
      const largeBubble = new PlayerBubble(mockScene, 400, 300, 60);
      
      expect(smallBubble.getSpeed()).toBeGreaterThan(largeBubble.getSpeed());
    });

    it('should have minimum speed of 50', () => {
      // For size 125 or larger, speed should be capped at 50
      const veryLargeBubble = new PlayerBubble(mockScene, 400, 300, 150);
      expect(veryLargeBubble.getSpeed()).toBe(50);
      
      // For size 100, speed is 100 (not at minimum yet)
      const largeBubble = new PlayerBubble(mockScene, 400, 300, 100);
      expect(largeBubble.getSpeed()).toBe(100);
    });

    it('should calculate speed using formula: max(50, 300 - size * 2)', () => {
      const bubble = new PlayerBubble(mockScene, 400, 300, 30);
      const expectedSpeed = Math.max(50, 300 - (30 * 2));
      expect(bubble.getSpeed()).toBe(expectedSpeed);
    });
  });

  describe('setTarget()', () => {
    it('should set target position', () => {
      const bubble = new PlayerBubble(mockScene, 100, 100, 30);
      bubble.setTarget(200, 300);
      
      expect(bubble.targetX).toBe(200);
      expect(bubble.targetY).toBe(300);
    });
  });

  describe('grow()', () => {
    it('should grow by floor(sqrt(consumedSize))', () => {
      const bubble = new PlayerBubble(mockScene, 400, 300, 30);
      
      // Consume a bubble of size 16
      // Growth should be floor(sqrt(16)) = 4
      bubble.grow(16);
      expect(bubble.size).toBe(34);
    });

    it('should grow correctly for various consumed sizes', () => {
      const bubble = new PlayerBubble(mockScene, 400, 300, 30);
      
      // Consume size 25: floor(sqrt(25)) = 5
      bubble.grow(25);
      expect(bubble.size).toBe(35);
      
      // Consume size 10: floor(sqrt(10)) = 3
      bubble.grow(10);
      expect(bubble.size).toBe(38);
      
      // Consume size 49: floor(sqrt(49)) = 7
      bubble.grow(49);
      expect(bubble.size).toBe(45);
    });

    it('should cap size at 100 pixels', () => {
      const bubble = new PlayerBubble(mockScene, 400, 300, 95);
      
      // Consume a large bubble that would push size over 100
      // Growth would be floor(sqrt(100)) = 10, but should cap at 100
      bubble.grow(100);
      expect(bubble.size).toBe(100);
    });

    it('should not exceed 100 even with multiple consumptions', () => {
      const bubble = new PlayerBubble(mockScene, 400, 300, 90);
      
      bubble.grow(64); // floor(sqrt(64)) = 8, size becomes 98
      expect(bubble.size).toBe(98);
      
      bubble.grow(64); // floor(sqrt(64)) = 8, but should cap at 100
      expect(bubble.size).toBe(100);
      
      bubble.grow(100); // Should stay at 100
      expect(bubble.size).toBe(100);
    });

    it('should handle small consumed sizes', () => {
      const bubble = new PlayerBubble(mockScene, 400, 300, 30);
      
      // Consume size 1: floor(sqrt(1)) = 1
      bubble.grow(1);
      expect(bubble.size).toBe(31);
      
      // Consume size 2: floor(sqrt(2)) = 1
      bubble.grow(2);
      expect(bubble.size).toBe(32);
      
      // Consume size 3: floor(sqrt(3)) = 1
      bubble.grow(3);
      expect(bubble.size).toBe(33);
    });

    it('should handle zero consumed size', () => {
      const bubble = new PlayerBubble(mockScene, 400, 300, 30);
      
      // Consume size 0: floor(sqrt(0)) = 0
      bubble.grow(0);
      expect(bubble.size).toBe(30); // No change
    });
  });

  describe('update()', () => {
    it('should move toward target position', () => {
      const bubble = new PlayerBubble(mockScene, 100, 100, 30);
      bubble.targetX = 200;
      bubble.targetY = 200;
      
      const initialX = bubble.x;
      const initialY = bubble.y;
      
      bubble.update(16); // 16ms frame time
      
      // Bubble should have moved toward target
      expect(bubble.x).toBeGreaterThan(initialX);
      expect(bubble.y).toBeGreaterThan(initialY);
      expect(bubble.x).toBeLessThanOrEqual(200);
      expect(bubble.y).toBeLessThanOrEqual(200);
    });

    it('should not overshoot target', () => {
      const bubble = new PlayerBubble(mockScene, 100, 100, 30);
      bubble.targetX = 101;
      bubble.targetY = 101;
      
      // Multiple updates should not overshoot
      for (let i = 0; i < 10; i++) {
        bubble.update(16);
      }
      
      expect(bubble.x).toBeLessThanOrEqual(101);
      expect(bubble.y).toBeLessThanOrEqual(101);
    });

    it('should constrain position to world boundaries', () => {
      const bubble = new PlayerBubble(mockScene, 400, 300, 30);
      const radius = bubble.getRadius();
      
      // Try to move beyond left boundary
      bubble.targetX = -100;
      bubble.targetY = 300;
      bubble.update(100);
      expect(bubble.x).toBeGreaterThanOrEqual(radius);
      
      // Try to move beyond right boundary
      bubble.x = 400;
      bubble.targetX = 900;
      bubble.targetY = 300;
      bubble.update(100);
      expect(bubble.x).toBeLessThanOrEqual(800 - radius);
      
      // Try to move beyond top boundary
      bubble.x = 400;
      bubble.y = 300;
      bubble.targetX = 400;
      bubble.targetY = -100;
      bubble.update(100);
      expect(bubble.y).toBeGreaterThanOrEqual(radius);
      
      // Try to move beyond bottom boundary
      bubble.y = 300;
      bubble.targetX = 400;
      bubble.targetY = 700;
      bubble.update(100);
      expect(bubble.y).toBeLessThanOrEqual(600 - radius);
    });

    it('should move faster when smaller', () => {
      const smallBubble = new PlayerBubble(mockScene, 100, 100, 20);
      const largeBubble = new PlayerBubble(mockScene, 100, 100, 80);
      
      smallBubble.targetX = 200;
      smallBubble.targetY = 100;
      largeBubble.targetX = 200;
      largeBubble.targetY = 100;
      
      smallBubble.update(16);
      largeBubble.update(16);
      
      const smallDistance = 200 - smallBubble.x;
      const largeDistance = 200 - largeBubble.x;
      
      // Small bubble should have moved further (less distance remaining)
      expect(smallDistance).toBeLessThan(largeDistance);
    });

    it('should not move if already at target', () => {
      const bubble = new PlayerBubble(mockScene, 100, 100, 30);
      bubble.targetX = 100;
      bubble.targetY = 100;
      
      bubble.update(16);
      
      expect(bubble.x).toBe(100);
      expect(bubble.y).toBe(100);
    });

    it('should handle delta time correctly', () => {
      const bubble1 = new PlayerBubble(mockScene, 100, 100, 30);
      const bubble2 = new PlayerBubble(mockScene, 100, 100, 30);
      
      bubble1.targetX = 200;
      bubble1.targetY = 100;
      bubble2.targetX = 200;
      bubble2.targetY = 100;
      
      // Update with different delta times
      bubble1.update(16); // 16ms
      bubble2.update(32); // 32ms (double)
      
      const distance1 = 200 - bubble1.x;
      const distance2 = 200 - bubble2.x;
      
      // Bubble2 should have moved approximately twice as far
      expect(distance2).toBeLessThan(distance1);
    });
  });
});

  describe('render()', () => {
    it('should create graphics object on first render', () => {
      const mockGraphics = {
        clear: () => {},
        fillStyle: () => {},
        fillCircle: () => {},
        lineStyle: () => {},
        strokeCircle: () => {}
      };
      
      const mockSceneWithGraphics = {
        add: {
          graphics: () => mockGraphics
        }
      };
      
      const bubble = new PlayerBubble(mockSceneWithGraphics, 400, 300, 30);
      expect(bubble.graphics).toBeNull();
      
      bubble.render();
      expect(bubble.graphics).toBe(mockGraphics);
    });

    it('should draw gray circle with blue border', () => {
      const calls = [];
      const mockGraphics = {
        clear: () => calls.push('clear'),
        fillStyle: (color, alpha) => calls.push(['fillStyle', color, alpha]),
        fillCircle: (x, y, radius) => calls.push(['fillCircle', x, y, radius]),
        lineStyle: (width, color, alpha) => calls.push(['lineStyle', width, color, alpha]),
        strokeCircle: (x, y, radius) => calls.push(['strokeCircle', x, y, radius])
      };
      
      const mockSceneWithGraphics = {
        add: {
          graphics: () => mockGraphics
        }
      };
      
      const bubble = new PlayerBubble(mockSceneWithGraphics, 400, 300, 30);
      bubble.render();
      
      // Verify the rendering sequence
      expect(calls[0]).toBe('clear');
      expect(calls[1]).toEqual(['fillStyle', 0x808080, 1]); // Gray fill
      expect(calls[2]).toEqual(['fillCircle', 400, 300, 15]); // Radius is size/2
      expect(calls[3]).toEqual(['lineStyle', 2, 0x4a90e2, 1]); // Blue border, 2px width
      expect(calls[4]).toEqual(['strokeCircle', 400, 300, 15]); // Radius is size/2
    });

    it('should render at current position', () => {
      const calls = [];
      const mockGraphics = {
        clear: () => {},
        fillStyle: () => {},
        fillCircle: (x, y, radius) => calls.push({ x, y, radius }),
        lineStyle: () => {},
        strokeCircle: (x, y, radius) => calls.push({ x, y, radius })
      };
      
      const mockSceneWithGraphics = {
        add: {
          graphics: () => mockGraphics
        }
      };
      
      const bubble = new PlayerBubble(mockSceneWithGraphics, 200, 150, 40);
      bubble.render();
      
      // Both fillCircle and strokeCircle should use current position
      expect(calls[0]).toEqual({ x: 200, y: 150, radius: 20 });
      expect(calls[1]).toEqual({ x: 200, y: 150, radius: 20 });
    });

    it('should use correct radius based on size', () => {
      const calls = [];
      const mockGraphics = {
        clear: () => {},
        fillStyle: () => {},
        fillCircle: (x, y, radius) => calls.push(radius),
        lineStyle: () => {},
        strokeCircle: (x, y, radius) => calls.push(radius)
      };
      
      const mockSceneWithGraphics = {
        add: {
          graphics: () => mockGraphics
        }
      };
      
      const bubble = new PlayerBubble(mockSceneWithGraphics, 400, 300, 60);
      bubble.render();
      
      // Radius should be size/2 = 30
      expect(calls[0]).toBe(30);
      expect(calls[1]).toBe(30);
    });

    it('should clear graphics before each render', () => {
      let clearCount = 0;
      const mockGraphics = {
        clear: () => clearCount++,
        fillStyle: () => {},
        fillCircle: () => {},
        lineStyle: () => {},
        strokeCircle: () => {}
      };
      
      const mockSceneWithGraphics = {
        add: {
          graphics: () => mockGraphics
        }
      };
      
      const bubble = new PlayerBubble(mockSceneWithGraphics, 400, 300, 30);
      
      bubble.render();
      expect(clearCount).toBe(1);
      
      bubble.render();
      expect(clearCount).toBe(2);
      
      bubble.render();
      expect(clearCount).toBe(3);
    });
  });
