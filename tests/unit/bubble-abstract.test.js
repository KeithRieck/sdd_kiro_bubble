/**
 * Unit tests for Bubble abstract class
 * Verifies that abstract methods throw errors when not overridden
 */

import Bubble from '../../src/entities/Bubble.js';

describe('Bubble Abstract Class', () => {
  // Mock Phaser scene
  const mockScene = {
    add: {
      graphics: () => ({})
    }
  };

  describe('Abstract Method Enforcement', () => {
    test('should throw error when instantiated directly', () => {
      expect(() => {
        new Bubble(mockScene, 100, 100, 30);
      }).toThrow('Bubble is an abstract class and cannot be instantiated directly');
    });

    test('update() should throw error if not overridden', () => {
      // Create a minimal subclass that doesn't override update()
      class TestBubble extends Bubble {
        render() {
          // Implement render to avoid that error
        }
      }

      const bubble = new TestBubble(mockScene, 100, 100, 30);
      
      expect(() => {
        bubble.update(16);
      }).toThrow('update() must be implemented by subclass');
    });

    test('render() should throw error if not overridden', () => {
      // Create a minimal subclass that doesn't override render()
      class TestBubble extends Bubble {
        update(delta) {
          // Implement update to avoid that error
        }
      }

      const bubble = new TestBubble(mockScene, 100, 100, 30);
      
      expect(() => {
        bubble.render();
      }).toThrow('render() must be implemented by subclass');
    });

    test('should not throw errors when both methods are properly overridden', () => {
      // Create a proper subclass that overrides both methods
      class TestBubble extends Bubble {
        update(delta) {
          this.x += 1;
        }
        
        render() {
          // Render implementation
        }
      }

      const bubble = new TestBubble(mockScene, 100, 100, 30);
      
      expect(() => {
        bubble.update(16);
        bubble.render();
      }).not.toThrow();
    });
  });
});
