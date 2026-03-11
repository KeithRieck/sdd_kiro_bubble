/**
 * Unit tests for SpawnSystem
 * Tests specific examples, edge cases, and integration points
 */

import { describe, it, expect, beforeEach } from 'vitest';
import SpawnSystem from '../../../src/systems/SpawnSystem.js';

// Mock scene object for testing
const createMockScene = () => ({
  add: {
    graphics: () => ({
      clear: () => {},
      fillStyle: () => {},
      fillCircle: () => {},
      lineStyle: () => {},
      strokeCircle: () => {}
    })
  }
});

describe('SpawnSystem', () => {
  let scene;
  let spawnSystem;

  beforeEach(() => {
    scene = createMockScene();
    spawnSystem = new SpawnSystem(scene, 800, 600, 10);
  });

  describe('constructor', () => {
    it('should initialize with correct default values', () => {
      expect(spawnSystem.scene).toBe(scene);
      expect(spawnSystem.worldWidth).toBe(800);
      expect(spawnSystem.worldHeight).toBe(600);
      expect(spawnSystem.targetBubbleCount).toBe(10);
    });

    it('should use custom initial bubble count', () => {
      const customSystem = new SpawnSystem(scene, 800, 600, 20);
      expect(customSystem.targetBubbleCount).toBe(20);
    });
  });

  describe('incrementDifficulty', () => {
    it('should increase target count by 2', () => {
      expect(spawnSystem.getTargetCount()).toBe(10);
      spawnSystem.incrementDifficulty();
      expect(spawnSystem.getTargetCount()).toBe(12);
    });

    it('should increment multiple times correctly', () => {
      spawnSystem.incrementDifficulty();
      spawnSystem.incrementDifficulty();
      spawnSystem.incrementDifficulty();
      expect(spawnSystem.getTargetCount()).toBe(16);
    });
  });

  describe('getTargetCount', () => {
    it('should return current target bubble count', () => {
      expect(spawnSystem.getTargetCount()).toBe(10);
    });
  });

  describe('calculateSizeRange', () => {
    it('should calculate correct range for player size 30', () => {
      const range = spawnSystem.calculateSizeRange(30);
      expect(range.min).toBe(15); // max(10, 30 * 0.5)
      expect(range.max).toBe(45); // min(70, 30 * 1.5)
    });

    it('should enforce minimum size of 10', () => {
      const range = spawnSystem.calculateSizeRange(15);
      expect(range.min).toBe(10); // max(10, 15 * 0.5 = 7.5)
      expect(range.max).toBe(22); // min(70, 15 * 1.5 = 22.5)
    });

    it('should enforce maximum size of 70', () => {
      const range = spawnSystem.calculateSizeRange(60);
      expect(range.min).toBe(30); // max(10, 60 * 0.5)
      expect(range.max).toBe(70); // min(70, 60 * 1.5 = 90)
    });

    it('should handle edge case of player size 100', () => {
      const range = spawnSystem.calculateSizeRange(100);
      expect(range.min).toBe(50); // max(10, 100 * 0.5)
      expect(range.max).toBe(70); // min(70, 100 * 1.5 = 150)
    });
  });

  describe('generateBalancedSize', () => {
    it('should generate size within valid range', () => {
      const playerSize = 40;
      const sizeRange = spawnSystem.calculateSizeRange(playerSize);
      
      // Test multiple times due to randomness
      for (let i = 0; i < 50; i++) {
        const size = spawnSystem.generateBalancedSize(sizeRange, playerSize);
        expect(size).toBeGreaterThanOrEqual(sizeRange.min);
        expect(size).toBeLessThanOrEqual(sizeRange.max);
      }
    });

    it('should handle edge case where min equals player size', () => {
      const playerSize = 20;
      const sizeRange = { min: 20, max: 30 };
      
      const size = spawnSystem.generateBalancedSize(sizeRange, playerSize);
      expect(size).toBeGreaterThanOrEqual(sizeRange.min);
      expect(size).toBeLessThanOrEqual(sizeRange.max);
    });

    it('should handle edge case where max equals player size', () => {
      const playerSize = 70;
      const sizeRange = { min: 35, max: 70 };
      
      const size = spawnSystem.generateBalancedSize(sizeRange, playerSize);
      expect(size).toBeGreaterThanOrEqual(sizeRange.min);
      expect(size).toBeLessThanOrEqual(sizeRange.max);
    });
  });

  describe('getRandomPosition', () => {
    it('should generate position with proper margin for size 20', () => {
      const size = 20;
      const margin = size / 2 + 10; // 20
      
      for (let i = 0; i < 20; i++) {
        const pos = spawnSystem.getRandomPosition(size);
        expect(pos.x).toBeGreaterThanOrEqual(margin);
        expect(pos.x).toBeLessThanOrEqual(800 - margin);
        expect(pos.y).toBeGreaterThanOrEqual(margin);
        expect(pos.y).toBeLessThanOrEqual(600 - margin);
      }
    });

    it('should generate position with proper margin for size 70', () => {
      const size = 70;
      const margin = size / 2 + 10; // 45
      
      for (let i = 0; i < 20; i++) {
        const pos = spawnSystem.getRandomPosition(size);
        expect(pos.x).toBeGreaterThanOrEqual(margin);
        expect(pos.x).toBeLessThanOrEqual(800 - margin);
        expect(pos.y).toBeGreaterThanOrEqual(margin);
        expect(pos.y).toBeLessThanOrEqual(600 - margin);
      }
    });
  });

  describe('getRandomVelocity', () => {
    it('should generate velocity with speed in range 50-150', () => {
      for (let i = 0; i < 20; i++) {
        const vel = spawnSystem.getRandomVelocity();
        const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
        expect(speed).toBeGreaterThanOrEqual(50);
        expect(speed).toBeLessThanOrEqual(150);
      }
    });

    it('should generate velocity with both x and y components', () => {
      const vel = spawnSystem.getRandomVelocity();
      expect(typeof vel.x).toBe('number');
      expect(typeof vel.y).toBe('number');
      expect(isNaN(vel.x)).toBe(false);
      expect(isNaN(vel.y)).toBe(false);
    });
  });

  describe('spawnBubble', () => {
    it('should spawn bubble when below capacity', () => {
      const bubble = spawnSystem.spawnBubble(30, 5);
      expect(bubble).not.toBeNull();
      expect(bubble.size).toBeGreaterThanOrEqual(10);
      expect(bubble.size).toBeLessThanOrEqual(70);
    });

    it('should return null when at capacity', () => {
      const bubble = spawnSystem.spawnBubble(30, 10);
      expect(bubble).toBeNull();
    });

    it('should return null when over capacity', () => {
      const bubble = spawnSystem.spawnBubble(30, 15);
      expect(bubble).toBeNull();
    });

    it('should spawn bubble with valid position', () => {
      const bubble = spawnSystem.spawnBubble(30, 0);
      expect(bubble).not.toBeNull();
      
      const margin = bubble.size / 2 + 10;
      expect(bubble.x).toBeGreaterThanOrEqual(margin);
      expect(bubble.x).toBeLessThanOrEqual(800 - margin);
      expect(bubble.y).toBeGreaterThanOrEqual(margin);
      expect(bubble.y).toBeLessThanOrEqual(600 - margin);
    });

    it('should spawn bubble with valid velocity', () => {
      const bubble = spawnSystem.spawnBubble(30, 0);
      expect(bubble).not.toBeNull();
      
      const speed = Math.sqrt(bubble.velocityX ** 2 + bubble.velocityY ** 2);
      expect(speed).toBeGreaterThanOrEqual(50);
      expect(speed).toBeLessThanOrEqual(150);
    });

    it('should spawn bubbles with varying sizes', () => {
      const sizes = new Set();
      
      // Spawn multiple bubbles and collect sizes
      for (let i = 0; i < 20; i++) {
        const bubble = spawnSystem.spawnBubble(40, i);
        if (bubble) {
          sizes.add(bubble.size);
        }
      }
      
      // Should have some variety in sizes (at least 3 different sizes)
      expect(sizes.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('integration', () => {
    it('should maintain consistent behavior across multiple spawns', () => {
      const playerSize = 40;
      const bubbles = [];
      
      for (let i = 0; i < 10; i++) {
        const bubble = spawnSystem.spawnBubble(playerSize, i);
        if (bubble) {
          bubbles.push(bubble);
        }
      }
      
      expect(bubbles.length).toBe(10);
      
      // All bubbles should have valid properties
      bubbles.forEach(bubble => {
        expect(bubble.size).toBeGreaterThanOrEqual(10);
        expect(bubble.size).toBeLessThanOrEqual(70);
        expect(bubble.x).toBeGreaterThan(0);
        expect(bubble.x).toBeLessThan(800);
        expect(bubble.y).toBeGreaterThan(0);
        expect(bubble.y).toBeLessThan(600);
      });
    });

    it('should work with difficulty progression', () => {
      expect(spawnSystem.getTargetCount()).toBe(10);
      
      // Spawn initial set
      for (let i = 0; i < 10; i++) {
        const bubble = spawnSystem.spawnBubble(30, i);
        expect(bubble).not.toBeNull();
      }
      
      // Should be at capacity
      expect(spawnSystem.spawnBubble(30, 10)).toBeNull();
      
      // Increment difficulty
      spawnSystem.incrementDifficulty();
      expect(spawnSystem.getTargetCount()).toBe(12);
      
      // Should be able to spawn 2 more
      expect(spawnSystem.spawnBubble(30, 10)).not.toBeNull();
      expect(spawnSystem.spawnBubble(30, 11)).not.toBeNull();
      expect(spawnSystem.spawnBubble(30, 12)).toBeNull();
    });
  });
});
