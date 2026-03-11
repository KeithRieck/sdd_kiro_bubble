import { describe, it, expect } from 'vitest';
import Bubble from '../../../src/entities/Bubble.js';

describe('Bubble Abstract Class', () => {
  describe('Abstract class instantiation', () => {
    it('should throw error when instantiated directly', () => {
      expect(() => {
        new Bubble(null, 0, 0, 30);
      }).toThrow('Bubble is an abstract class and cannot be instantiated directly');
    });
  });

  describe('Abstract methods', () => {
    // Create a minimal concrete subclass for testing abstract methods
    class TestBubble extends Bubble {
      constructor(scene, x, y, size) {
        super(scene, x, y, size);
      }
    }

    it('should throw error when update() is not overridden', () => {
      const bubble = new TestBubble(null, 100, 100, 30);
      expect(() => {
        bubble.update(16);
      }).toThrow('update() must be implemented by subclass');
    });

    it('should throw error when render() is not overridden', () => {
      const bubble = new TestBubble(null, 100, 100, 30);
      expect(() => {
        bubble.render();
      }).toThrow('render() must be implemented by subclass');
    });

    it('should not throw when update() is properly overridden', () => {
      class ProperBubble extends Bubble {
        update(delta) {
          // Proper implementation
          this.x += 1;
        }
        render() {
          // Proper implementation
        }
      }

      const bubble = new ProperBubble(null, 100, 100, 30);
      expect(() => {
        bubble.update(16);
      }).not.toThrow();
    });

    it('should not throw when render() is properly overridden', () => {
      class ProperBubble extends Bubble {
        update(delta) {
          // Proper implementation
        }
        render() {
          // Proper implementation
          this.graphics = {};
        }
      }

      const bubble = new ProperBubble(null, 100, 100, 30);
      expect(() => {
        bubble.render();
      }).not.toThrow();
    });
  });

  describe('Common functionality', () => {
    class TestBubble extends Bubble {
      update(delta) {}
      render() {}
    }

    it('should calculate radius correctly', () => {
      const bubble = new TestBubble(null, 100, 100, 30);
      expect(bubble.getRadius()).toBe(15);
    });

    it('should check bounds correctly', () => {
      const bubble = new TestBubble(null, 100, 100, 30);
      expect(bubble.isWithinBounds(100, 100, 800, 600)).toBe(true);
      expect(bubble.isWithinBounds(10, 100, 800, 600)).toBe(false); // Too close to left edge
      expect(bubble.isWithinBounds(795, 100, 800, 600)).toBe(false); // Too close to right edge
    });

    it('should constrain to bounds correctly', () => {
      const bubble = new TestBubble(null, 10, 100, 30);
      bubble.constrainToBounds(800, 600);
      expect(bubble.x).toBe(15); // Constrained to radius distance from edge

      bubble.x = 795;
      bubble.constrainToBounds(800, 600);
      expect(bubble.x).toBe(785); // Constrained to radius distance from edge
    });
  });
});
