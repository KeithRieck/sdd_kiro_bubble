import { describe, it, expect } from 'vitest';
import AIBubble from '../../../src/entities/AIBubble.js';

describe('AIBubble', () => {
  const mockScene = {
    add: {
      graphics: () => ({
        clear: () => {},
        fillStyle: () => {},
        fillCircle: () => {}
      })
    }
  };

  describe('Constructor', () => {
    it('should initialize with position, size, and velocity', () => {
      const bubble = new AIBubble(mockScene, 200, 150, 40, 50, -30);
      
      expect(bubble.x).toBe(200);
      expect(bubble.y).toBe(150);
      expect(bubble.size).toBe(40);
      expect(bubble.velocityX).toBe(50);
      expect(bubble.velocityY).toBe(-30);
    });

    it('should generate a pastel color on construction', () => {
      const bubble = new AIBubble(mockScene, 200, 150, 40, 50, -30);
      
      expect(bubble.color).toBeDefined();
      expect(typeof bubble.color).toBe('number');
      expect(bubble.color).toBeGreaterThanOrEqual(0);
      expect(bubble.color).toBeLessThanOrEqual(0xFFFFFF);
    });

    it('should generate different colors for different bubbles', () => {
      const colors = new Set();
      
      // Create multiple bubbles and collect their colors
      for (let i = 0; i < 20; i++) {
        const bubble = new AIBubble(mockScene, 100, 100, 30, 50, 50);
        colors.add(bubble.color);
      }
      
      // Should have generated multiple different colors (not all the same)
      expect(colors.size).toBeGreaterThan(1);
    });
  });

  describe('generatePastelColor()', () => {
    it('should return a valid hex color', () => {
      const bubble = new AIBubble(mockScene, 100, 100, 30, 50, 50);
      const color = bubble.generatePastelColor();
      
      expect(typeof color).toBe('number');
      expect(color).toBeGreaterThanOrEqual(0);
      expect(color).toBeLessThanOrEqual(0xFFFFFF);
    });

    it('should generate pastel colors (not too dark or too vibrant)', () => {
      const bubble = new AIBubble(mockScene, 100, 100, 30, 50, 50);
      
      // Generate multiple colors and check they look pastel-ish
      for (let i = 0; i < 10; i++) {
        const color = bubble.generatePastelColor();
        
        // Extract RGB components
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        
        // Pastel colors should be relatively bright (high RGB values)
        // With lightness 70-85%, RGB values should generally be > 150
        const avgBrightness = (r + g + b) / 3;
        expect(avgBrightness).toBeGreaterThan(100); // Not too dark
      }
    });
  });

  describe('hslToHex()', () => {
    it('should convert pure red (0°, 100%, 50%) correctly', () => {
      const bubble = new AIBubble(mockScene, 100, 100, 30, 50, 50);
      const color = bubble.hslToHex(0, 100, 50);
      
      expect(color).toBe(0xFF0000);
    });

    it('should convert pure green (120°, 100%, 50%) correctly', () => {
      const bubble = new AIBubble(mockScene, 100, 100, 30, 50, 50);
      const color = bubble.hslToHex(120, 100, 50);
      
      expect(color).toBe(0x00FF00);
    });

    it('should convert pure blue (240°, 100%, 50%) correctly', () => {
      const bubble = new AIBubble(mockScene, 100, 100, 30, 50, 50);
      const color = bubble.hslToHex(240, 100, 50);
      
      expect(color).toBe(0x0000FF);
    });

    it('should handle pastel color ranges correctly', () => {
      const bubble = new AIBubble(mockScene, 100, 100, 30, 50, 50);
      
      // Test a pastel pink (hue ~350, low saturation, high lightness)
      const pastelPink = bubble.hslToHex(350, 30, 80);
      expect(typeof pastelPink).toBe('number');
      expect(pastelPink).toBeGreaterThan(0);
      
      // Test a pastel blue (hue ~200, low saturation, high lightness)
      const pastelBlue = bubble.hslToHex(200, 40, 75);
      expect(typeof pastelBlue).toBe('number');
      expect(pastelBlue).toBeGreaterThan(0);
    });

    it('should handle grayscale (0% saturation)', () => {
      const bubble = new AIBubble(mockScene, 100, 100, 30, 50, 50);
      
      // Any hue with 0% saturation should produce gray
      const gray1 = bubble.hslToHex(0, 0, 50);
      const gray2 = bubble.hslToHex(180, 0, 50);
      
      // Both should be the same gray value
      expect(gray1).toBe(gray2);
      
      // Extract RGB - all components should be equal for gray
      const r = (gray1 >> 16) & 0xFF;
      const g = (gray1 >> 8) & 0xFF;
      const b = gray1 & 0xFF;
      
      expect(r).toBe(g);
      expect(g).toBe(b);
    });

    it('should handle white (100% lightness)', () => {
      const bubble = new AIBubble(mockScene, 100, 100, 30, 50, 50);
      const white = bubble.hslToHex(0, 100, 100);
      
      expect(white).toBe(0xFFFFFF);
    });

    it('should handle black (0% lightness)', () => {
      const bubble = new AIBubble(mockScene, 100, 100, 30, 50, 50);
      const black = bubble.hslToHex(0, 100, 0);
      
      expect(black).toBe(0x000000);
    });
  });

  describe('update()', () => {
    it('should move based on velocity and delta time', () => {
      const bubble = new AIBubble(mockScene, 100, 100, 30, 100, 50);
      
      // Update with 1 second (1000ms)
      bubble.update(1000);
      
      // Position should have moved by velocity * time
      expect(bubble.x).toBe(200); // 100 + 100*1
      expect(bubble.y).toBe(150); // 100 + 50*1
    });

    it('should handle fractional delta times', () => {
      const bubble = new AIBubble(mockScene, 100, 100, 30, 100, 50);
      
      // Update with 16ms (typical frame time)
      bubble.update(16);
      
      // Position should have moved by velocity * 0.016
      expect(bubble.x).toBeCloseTo(100 + 100 * 0.016, 1);
      expect(bubble.y).toBeCloseTo(100 + 50 * 0.016, 1);
    });

    it('should bounce off left boundary', () => {
      const bubble = new AIBubble(mockScene, 20, 300, 30, -100, 0);
      const initialVelocityX = bubble.velocityX;
      
      // Update to move past left boundary
      bubble.update(500);
      
      // Velocity should have reversed
      expect(bubble.velocityX).toBe(-initialVelocityX);
      expect(bubble.velocityY).toBe(0); // Y velocity unchanged
      
      // Position should be constrained
      expect(bubble.x).toBeGreaterThanOrEqual(bubble.getRadius());
    });

    it('should bounce off right boundary', () => {
      const bubble = new AIBubble(mockScene, 780, 300, 30, 100, 0);
      const initialVelocityX = bubble.velocityX;
      
      // Update to move past right boundary
      bubble.update(500);
      
      // Velocity should have reversed
      expect(bubble.velocityX).toBe(-initialVelocityX);
      expect(bubble.velocityY).toBe(0); // Y velocity unchanged
      
      // Position should be constrained
      expect(bubble.x).toBeLessThanOrEqual(800 - bubble.getRadius());
    });

    it('should bounce off top boundary', () => {
      const bubble = new AIBubble(mockScene, 400, 20, 30, 0, -100);
      const initialVelocityY = bubble.velocityY;
      
      // Update to move past top boundary
      bubble.update(500);
      
      // Velocity should have reversed
      expect(bubble.velocityX).toBe(0); // X velocity unchanged
      expect(bubble.velocityY).toBe(-initialVelocityY);
      
      // Position should be constrained
      expect(bubble.y).toBeGreaterThanOrEqual(bubble.getRadius());
    });

    it('should bounce off bottom boundary', () => {
      const bubble = new AIBubble(mockScene, 400, 580, 30, 0, 100);
      const initialVelocityY = bubble.velocityY;
      
      // Update to move past bottom boundary
      bubble.update(500);
      
      // Velocity should have reversed
      expect(bubble.velocityX).toBe(0); // X velocity unchanged
      expect(bubble.velocityY).toBe(-initialVelocityY);
      
      // Position should be constrained
      expect(bubble.y).toBeLessThanOrEqual(600 - bubble.getRadius());
    });

    it('should handle corner bounces', () => {
      const bubble = new AIBubble(mockScene, 20, 20, 30, -100, -100);
      
      // Update to hit top-left corner
      bubble.update(500);
      
      // Both velocities should have reversed
      expect(bubble.velocityX).toBe(100);
      expect(bubble.velocityY).toBe(100);
      
      // Position should be constrained
      expect(bubble.x).toBeGreaterThanOrEqual(bubble.getRadius());
      expect(bubble.y).toBeGreaterThanOrEqual(bubble.getRadius());
    });

    it('should maintain constant velocity between bounces', () => {
      const bubble = new AIBubble(mockScene, 400, 300, 30, 75, 50);
      
      const initialVelocityX = bubble.velocityX;
      const initialVelocityY = bubble.velocityY;
      
      // Update multiple times without hitting boundaries
      for (let i = 0; i < 5; i++) {
        bubble.update(16);
      }
      
      // Velocity should remain constant
      expect(bubble.velocityX).toBe(initialVelocityX);
      expect(bubble.velocityY).toBe(initialVelocityY);
    });

    it('should handle multiple bounces correctly', () => {
      const bubble = new AIBubble(mockScene, 20, 300, 30, -100, 0);
      
      // First bounce off left wall
      bubble.update(100);
      expect(bubble.velocityX).toBe(100);
      
      // Move toward right wall
      bubble.update(8000); // Long time to reach right wall
      
      // Should have bounced off right wall
      expect(bubble.velocityX).toBe(-100);
    });

    it('should handle zero velocity', () => {
      const bubble = new AIBubble(mockScene, 400, 300, 30, 0, 0);
      
      const initialX = bubble.x;
      const initialY = bubble.y;
      
      bubble.update(100);
      
      // Position should not change
      expect(bubble.x).toBe(initialX);
      expect(bubble.y).toBe(initialY);
    });

    it('should handle negative velocities', () => {
      const bubble = new AIBubble(mockScene, 400, 300, 30, -50, -75);
      
      bubble.update(1000);
      
      // Should move in negative direction
      expect(bubble.x).toBe(350); // 400 + (-50)*1
      expect(bubble.y).toBe(225); // 300 + (-75)*1
    });
  });

  describe('render()', () => {
    it('should create graphics object on first render', () => {
      const mockGraphics = {
        clear: () => {},
        fillStyle: () => {},
        fillCircle: () => {}
      };
      
      const mockSceneWithGraphics = {
        add: {
          graphics: () => mockGraphics
        }
      };
      
      const bubble = new AIBubble(mockSceneWithGraphics, 400, 300, 30, 50, 50);
      expect(bubble.graphics).toBeNull();
      
      bubble.render();
      expect(bubble.graphics).toBe(mockGraphics);
    });

    it('should draw colored circle with no border', () => {
      const calls = [];
      const mockGraphics = {
        clear: () => calls.push('clear'),
        fillStyle: (color, alpha) => calls.push(['fillStyle', color, alpha]),
        fillCircle: (x, y, radius) => calls.push(['fillCircle', x, y, radius])
      };
      
      const mockSceneWithGraphics = {
        add: {
          graphics: () => mockGraphics
        }
      };
      
      const bubble = new AIBubble(mockSceneWithGraphics, 400, 300, 40, 50, 50);
      bubble.render();
      
      // Verify the rendering sequence
      expect(calls[0]).toBe('clear');
      expect(calls[1][0]).toBe('fillStyle');
      expect(calls[1][1]).toBe(bubble.color); // Should use bubble's color
      expect(calls[1][2]).toBe(1); // Full opacity
      expect(calls[2]).toEqual(['fillCircle', 400, 300, 20]); // Radius is size/2
    });

    it('should render at current position', () => {
      const calls = [];
      const mockGraphics = {
        clear: () => {},
        fillStyle: () => {},
        fillCircle: (x, y, radius) => calls.push({ x, y, radius })
      };
      
      const mockSceneWithGraphics = {
        add: {
          graphics: () => mockGraphics
        }
      };
      
      const bubble = new AIBubble(mockSceneWithGraphics, 250, 175, 50, 50, 50);
      bubble.render();
      
      expect(calls[0]).toEqual({ x: 250, y: 175, radius: 25 });
    });

    it('should use correct radius based on size', () => {
      const calls = [];
      const mockGraphics = {
        clear: () => {},
        fillStyle: () => {},
        fillCircle: (x, y, radius) => calls.push(radius)
      };
      
      const mockSceneWithGraphics = {
        add: {
          graphics: () => mockGraphics
        }
      };
      
      const bubble = new AIBubble(mockSceneWithGraphics, 400, 300, 60, 50, 50);
      bubble.render();
      
      // Radius should be size/2 = 30
      expect(calls[0]).toBe(30);
    });

    it('should clear graphics before each render', () => {
      let clearCount = 0;
      const mockGraphics = {
        clear: () => clearCount++,
        fillStyle: () => {},
        fillCircle: () => {}
      };
      
      const mockSceneWithGraphics = {
        add: {
          graphics: () => mockGraphics
        }
      };
      
      const bubble = new AIBubble(mockSceneWithGraphics, 400, 300, 30, 50, 50);
      
      bubble.render();
      expect(clearCount).toBe(1);
      
      bubble.render();
      expect(clearCount).toBe(2);
      
      bubble.render();
      expect(clearCount).toBe(3);
    });

    it('should use the generated pastel color', () => {
      let capturedColor = null;
      const mockGraphics = {
        clear: () => {},
        fillStyle: (color, alpha) => { capturedColor = color; },
        fillCircle: () => {}
      };
      
      const mockSceneWithGraphics = {
        add: {
          graphics: () => mockGraphics
        }
      };
      
      const bubble = new AIBubble(mockSceneWithGraphics, 400, 300, 30, 50, 50);
      bubble.render();
      
      // Should use the color generated in constructor
      expect(capturedColor).toBe(bubble.color);
    });
  });
});
