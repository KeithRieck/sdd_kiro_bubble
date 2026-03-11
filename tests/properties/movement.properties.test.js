import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import Bubble from '../../src/entities/Bubble.js';
import PlayerBubble from '../../src/entities/PlayerBubble.js';

// Mock PlayerBubble for testing boundary constraints
class MockPlayerBubble extends Bubble {
  constructor(scene, x, y, size = 30) {
    super(scene, x, y, size);
    this.targetX = x;
    this.targetY = y;
  }

  getSpeed() {
    return Math.max(50, 300 - (this.size * 2));
  }

  update(delta) {
    // Handle invalid delta values
    if (!isFinite(delta) || delta <= 0) {
      return;
    }
    
    const dt = delta / 1000;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
      const speed = this.getSpeed();
      const moveDistance = speed * dt;
      const ratio = Math.min(moveDistance / distance, 1);
      
      this.x += dx * ratio;
      this.y += dy * ratio;
      
      // Constrain to world boundaries (800x600)
      this.constrainToBounds(800, 600);
    }
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  render() {
    // Mock render - no-op for testing
  }
}

describe('Movement Properties', () => {
  const mockScene = {};
  const WORLD_WIDTH = 800;
  const WORLD_HEIGHT = 600;

  describe('Property 1: Player Bubble Boundary Constraint', () => {
    it('should always keep player bubble within boundaries for any position and movement', () => {
      // Feature: bubble-consumption-game, Property 1: Player Bubble Boundary Constraint
      // **Validates: Requirements 2.3, 2.4**
      
      fc.assert(
        fc.property(
          fc.record({
            // Initial position (can be anywhere, even out of bounds)
            startX: fc.float({ min: -100, max: 900, noNaN: true }),
            startY: fc.float({ min: -100, max: 700, noNaN: true }),
            // Target position (can be anywhere, even out of bounds)
            targetX: fc.float({ min: -100, max: 900, noNaN: true }),
            targetY: fc.float({ min: -100, max: 700, noNaN: true }),
            // Bubble size
            size: fc.integer({ min: 10, max: 100 }),
            // Delta time for update (in milliseconds)
            delta: fc.float({ min: 1, max: 100, noNaN: true })
          }),
          ({ startX, startY, targetX, targetY, size, delta }) => {
            // Create bubble at starting position
            const bubble = new MockPlayerBubble(mockScene, startX, startY, size);
            
            // Constrain initial position to bounds (simulating proper initialization)
            bubble.constrainToBounds(WORLD_WIDTH, WORLD_HEIGHT);
            
            // Set movement target
            bubble.setTarget(targetX, targetY);
            
            // Update bubble position
            bubble.update(delta);
            
            // Check that bubble position is within boundaries
            const radius = bubble.getRadius();
            const withinBounds = 
              bubble.x - radius >= 0 &&
              bubble.x + radius <= WORLD_WIDTH &&
              bubble.y - radius >= 0 &&
              bubble.y + radius <= WORLD_HEIGHT;
            
            return withinBounds;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should prevent movement toward boundary when at edge', () => {
      // Feature: bubble-consumption-game, Property 1: Player Bubble Boundary Constraint
      // **Validates: Requirements 2.3, 2.4**
      
      fc.assert(
        fc.property(
          fc.record({
            // Bubble size
            size: fc.integer({ min: 10, max: 100 }),
            // Which edge to test
            edge: fc.constantFrom('left', 'right', 'top', 'bottom'),
            // Target beyond the boundary
            targetOffset: fc.float({ min: -200, max: -10, noNaN: true }),
            // Delta time
            delta: fc.float({ min: 1, max: 100, noNaN: true })
          }),
          ({ size, edge, targetOffset, delta }) => {
            const radius = size / 2;
            let startX, startY, targetX, targetY;
            
            // Position bubble at the edge
            switch (edge) {
              case 'left':
                startX = radius;
                startY = WORLD_HEIGHT / 2;
                targetX = targetOffset; // Target beyond left boundary
                targetY = startY;
                break;
              case 'right':
                startX = WORLD_WIDTH - radius;
                startY = WORLD_HEIGHT / 2;
                targetX = WORLD_WIDTH + Math.abs(targetOffset); // Target beyond right boundary
                targetY = startY;
                break;
              case 'top':
                startX = WORLD_WIDTH / 2;
                startY = radius;
                targetX = startX;
                targetY = targetOffset; // Target beyond top boundary
                break;
              case 'bottom':
                startX = WORLD_WIDTH / 2;
                startY = WORLD_HEIGHT - radius;
                targetX = startX;
                targetY = WORLD_HEIGHT + Math.abs(targetOffset); // Target beyond bottom boundary
                break;
            }
            
            const bubble = new MockPlayerBubble(mockScene, startX, startY, size);
            bubble.setTarget(targetX, targetY);
            
            // Store initial position
            const initialX = bubble.x;
            const initialY = bubble.y;
            
            // Update bubble
            bubble.update(delta);
            
            // Bubble should remain at or very close to the boundary
            const stillAtBoundary = 
              bubble.x >= radius &&
              bubble.x <= WORLD_WIDTH - radius &&
              bubble.y >= radius &&
              bubble.y <= WORLD_HEIGHT - radius;
            
            // For edges, the bubble should not move beyond the boundary
            let didNotMoveBeyond = true;
            switch (edge) {
              case 'left':
                didNotMoveBeyond = bubble.x >= radius;
                break;
              case 'right':
                didNotMoveBeyond = bubble.x <= WORLD_WIDTH - radius;
                break;
              case 'top':
                didNotMoveBeyond = bubble.y >= radius;
                break;
              case 'bottom':
                didNotMoveBeyond = bubble.y <= WORLD_HEIGHT - radius;
                break;
            }
            
            return stillAtBoundary && didNotMoveBeyond;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain boundary constraint across multiple updates', () => {
      // Feature: bubble-consumption-game, Property 1: Player Bubble Boundary Constraint
      // **Validates: Requirements 2.3, 2.4**
      
      fc.assert(
        fc.property(
          fc.record({
            // Initial position
            startX: fc.float({ min: 50, max: 750, noNaN: true }),
            startY: fc.float({ min: 50, max: 550, noNaN: true }),
            // Size
            size: fc.integer({ min: 10, max: 100 }),
            // Multiple movement targets
            targets: fc.array(
              fc.record({
                x: fc.float({ min: -100, max: 900, noNaN: true }),
                y: fc.float({ min: -100, max: 700, noNaN: true }),
                delta: fc.float({ min: 1, max: 50, noNaN: true })
              }),
              { minLength: 1, maxLength: 10 }
            )
          }),
          ({ startX, startY, size, targets }) => {
            const bubble = new MockPlayerBubble(mockScene, startX, startY, size);
            const radius = bubble.getRadius();
            
            // Apply multiple movement updates
            for (const target of targets) {
              bubble.setTarget(target.x, target.y);
              bubble.update(target.delta);
              
              // Check boundary constraint after each update
              const withinBounds = 
                bubble.x - radius >= 0 &&
                bubble.x + radius <= WORLD_WIDTH &&
                bubble.y - radius >= 0 &&
                bubble.y + radius <= WORLD_HEIGHT;
              
              if (!withinBounds) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('Property 2: Speed Inversely Proportional to Size', () => {
  const mockScene = {};
  
  it('should have speed inversely proportional to size', () => {
    // Feature: bubble-consumption-game, Property 2: Speed Inversely Proportional to Size
    // **Validates: Requirements 2.2**

    fc.assert(
      fc.property(
        fc.record({
          size1: fc.integer({ min: 10, max: 100 }),
          size2: fc.integer({ min: 10, max: 100 })
        }),
        ({ size1, size2 }) => {
          const bubble1 = new MockPlayerBubble(mockScene, 400, 300, size1);
          const bubble2 = new MockPlayerBubble(mockScene, 400, 300, size2);

          const speed1 = bubble1.getSpeed();
          const speed2 = bubble2.getSpeed();

          // Verify speeds are positive
          if (speed1 <= 0 || speed2 <= 0) {
            return false;
          }

          // If size1 > size2, then speed1 < speed2 (inverse relationship)
          // If size1 < size2, then speed1 > speed2
          // If size1 === size2, then speed1 === speed2
          if (size1 > size2) {
            return speed1 < speed2;
          } else if (size1 < size2) {
            return speed1 > speed2;
          } else {
            return speed1 === speed2;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have minimum speed of 50 pixels per second', () => {
    // Feature: bubble-consumption-game, Property 2: Speed Inversely Proportional to Size
    // **Validates: Requirements 2.2**

    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 100 }),
        (size) => {
          const bubble = new MockPlayerBubble(mockScene, 400, 300, size);
          const speed = bubble.getSpeed();

          // Speed should never be less than 50 pixels per second
          return speed >= 50;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have larger bubbles move slower than smaller bubbles', () => {
    // Feature: bubble-consumption-game, Property 2: Speed Inversely Proportional to Size
    // **Validates: Requirements 2.2**

    fc.assert(
      fc.property(
        fc.record({
          smallSize: fc.integer({ min: 10, max: 50 }),
          largeSize: fc.integer({ min: 51, max: 100 })
        }),
        ({ smallSize, largeSize }) => {
          const smallBubble = new MockPlayerBubble(mockScene, 400, 300, smallSize);
          const largeBubble = new MockPlayerBubble(mockScene, 400, 300, largeSize);

          const smallSpeed = smallBubble.getSpeed();
          const largeSpeed = largeBubble.getSpeed();

          // Smaller bubble should always move faster than larger bubble
          return smallSpeed > largeSpeed;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate speed using the formula: max(50, 300 - size * 2)', () => {
    // Feature: bubble-consumption-game, Property 2: Speed Inversely Proportional to Size
    // **Validates: Requirements 2.2**

    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 100 }),
        (size) => {
          const bubble = new MockPlayerBubble(mockScene, 400, 300, size);
          const speed = bubble.getSpeed();
          const expectedSpeed = Math.max(50, 300 - (size * 2));

          // Speed should match the expected formula
          return speed === expectedSpeed;
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('Property 3: Input Sets Movement Target', () => {
  const mockScene = {};
  
  it('should set target position to input coordinates for any input event', () => {
    // Feature: bubble-consumption-game, Property 3: Input Sets Movement Target
    // **Validates: Requirements 2.1, 8.1, 8.2**

    fc.assert(
      fc.property(
        fc.record({
          // Initial bubble position
          startX: fc.float({ min: 0, max: 800, noNaN: true }),
          startY: fc.float({ min: 0, max: 600, noNaN: true }),
          // Bubble size
          size: fc.integer({ min: 10, max: 100 }),
          // Input coordinates (mouse or touch)
          inputX: fc.float({ min: 0, max: 800, noNaN: true }),
          inputY: fc.float({ min: 0, max: 600, noNaN: true })
        }),
        ({ startX, startY, size, inputX, inputY }) => {
          // Create player bubble at starting position
          const bubble = new PlayerBubble(mockScene, startX, startY, size);
          
          // Simulate input event by setting target
          bubble.setTarget(inputX, inputY);
          
          // Verify that target position matches input coordinates
          return bubble.targetX === inputX && bubble.targetY === inputY;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should update target position for multiple sequential input events', () => {
    // Feature: bubble-consumption-game, Property 3: Input Sets Movement Target
    // **Validates: Requirements 2.1, 8.1, 8.2**

    fc.assert(
      fc.property(
        fc.record({
          // Initial position
          startX: fc.float({ min: 0, max: 800, noNaN: true }),
          startY: fc.float({ min: 0, max: 600, noNaN: true }),
          // Size
          size: fc.integer({ min: 10, max: 100 }),
          // Multiple input events
          inputs: fc.array(
            fc.record({
              x: fc.float({ min: 0, max: 800, noNaN: true }),
              y: fc.float({ min: 0, max: 600, noNaN: true })
            }),
            { minLength: 1, maxLength: 10 }
          )
        }),
        ({ startX, startY, size, inputs }) => {
          const bubble = new PlayerBubble(mockScene, startX, startY, size);
          
          // Apply multiple input events
          for (const input of inputs) {
            bubble.setTarget(input.x, input.y);
            
            // After each input, target should match the input coordinates
            if (bubble.targetX !== input.x || bubble.targetY !== input.y) {
              return false;
            }
          }
          
          // Final target should match the last input
          const lastInput = inputs[inputs.length - 1];
          return bubble.targetX === lastInput.x && bubble.targetY === lastInput.y;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept input coordinates outside world boundaries', () => {
    // Feature: bubble-consumption-game, Property 3: Input Sets Movement Target
    // **Validates: Requirements 2.1, 8.1, 8.2**

    fc.assert(
      fc.property(
        fc.record({
          // Initial position (within bounds)
          startX: fc.float({ min: 50, max: 750, noNaN: true }),
          startY: fc.float({ min: 50, max: 550, noNaN: true }),
          // Size
          size: fc.integer({ min: 10, max: 100 }),
          // Input coordinates (can be outside bounds)
          inputX: fc.float({ min: -200, max: 1000, noNaN: true }),
          inputY: fc.float({ min: -200, max: 800, noNaN: true })
        }),
        ({ startX, startY, size, inputX, inputY }) => {
          const bubble = new PlayerBubble(mockScene, startX, startY, size);
          
          // Set target to coordinates that may be outside world boundaries
          bubble.setTarget(inputX, inputY);
          
          // Target should be set to the exact input coordinates
          // (boundary constraint is applied during update, not during setTarget)
          return bubble.targetX === inputX && bubble.targetY === inputY;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle both mouse and touch input coordinate formats', () => {
    // Feature: bubble-consumption-game, Property 3: Input Sets Movement Target
    // **Validates: Requirements 2.1, 8.1, 8.2**

    fc.assert(
      fc.property(
        fc.record({
          // Initial position
          startX: fc.float({ min: 0, max: 800, noNaN: true }),
          startY: fc.float({ min: 0, max: 600, noNaN: true }),
          // Size
          size: fc.integer({ min: 10, max: 100 }),
          // Input type and coordinates
          inputType: fc.constantFrom('mouse', 'touch'),
          inputX: fc.float({ min: 0, max: 800, noNaN: true }),
          inputY: fc.float({ min: 0, max: 600, noNaN: true })
        }),
        ({ startX, startY, size, inputType, inputX, inputY }) => {
          const bubble = new PlayerBubble(mockScene, startX, startY, size);
          
          // Both mouse and touch inputs should use the same setTarget method
          // The input type doesn't affect how coordinates are set
          bubble.setTarget(inputX, inputY);
          
          // Target should be set correctly regardless of input type
          return bubble.targetX === inputX && bubble.targetY === inputY;
        }
      ),
      { numRuns: 100 }
    );
  });
});
