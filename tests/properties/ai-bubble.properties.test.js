import { describe, it } from 'vitest';
import fc from 'fast-check';
import AIBubble from '../../src/entities/AIBubble.js';

describe('AI Bubble Properties', () => {
  const mockScene = {
    add: {
      graphics: () => ({
        clear: () => {},
        fillStyle: () => {},
        fillCircle: () => {}
      })
    }
  };

  const WORLD_WIDTH = 800;
  const WORLD_HEIGHT = 600;

  describe('Property 11: AI Bubble Boundary Bouncing', () => {
    it('should reverse X velocity when hitting left or right boundary', () => {
      // Feature: bubble-consumption-game, Property 11: AI Bubble Boundary Bouncing
      // **Validates: Requirements 4.3**

      fc.assert(
        fc.property(
          fc.record({
            // Y position (away from top/bottom boundaries to isolate X bouncing)
            y: fc.float({ min: 100, max: 500, noNaN: true }),
            // Bubble size
            size: fc.integer({ min: 10, max: 70 }),
            // X velocity (non-zero to ensure movement)
            velocityX: fc.float({ min: 50, max: 200, noNaN: true }),
            // Y velocity
            velocityY: fc.float({ min: -100, max: 100, noNaN: true }),
            // Which boundary to test
            boundary: fc.constantFrom('left', 'right'),
            // Delta time for update (long enough to ensure boundary hit)
            delta: fc.float({ min: 100, max: 500, noNaN: true })
          }),
          ({ y, size, velocityX, velocityY, boundary, delta }) => {
            const radius = size / 2;
            
            // Position bubble near the boundary
            let x;
            let initialVelocityX;
            
            if (boundary === 'left') {
              // Position near left boundary, moving left
              x = radius + 2;
              initialVelocityX = -Math.abs(velocityX); // Ensure moving left
            } else {
              // Position near right boundary, moving right
              x = WORLD_WIDTH - radius - 2;
              initialVelocityX = Math.abs(velocityX); // Ensure moving right
            }
            
            const bubble = new AIBubble(mockScene, x, y, size, initialVelocityX, velocityY);
            const initialVelocityY = bubble.velocityY;
            
            // Update to trigger boundary collision
            bubble.update(delta);
            
            // X velocity should have reversed (multiplied by -1)
            const velocityReversed = bubble.velocityX === -initialVelocityX;
            
            // Y velocity should remain unchanged
            const yVelocityUnchanged = bubble.velocityY === initialVelocityY;
            
            // Position should be constrained within boundaries
            const withinBounds = 
              bubble.x - radius >= 0 &&
              bubble.x + radius <= WORLD_WIDTH;
            
            return velocityReversed && yVelocityUnchanged && withinBounds;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reverse Y velocity when hitting top or bottom boundary', () => {
      // Feature: bubble-consumption-game, Property 11: AI Bubble Boundary Bouncing
      // **Validates: Requirements 4.3**

      fc.assert(
        fc.property(
          fc.record({
            // X position (away from left/right boundaries to isolate Y bouncing)
            x: fc.float({ min: 100, max: 700, noNaN: true }),
            // Bubble size
            size: fc.integer({ min: 10, max: 70 }),
            // X velocity
            velocityX: fc.float({ min: -100, max: 100, noNaN: true }),
            // Y velocity (non-zero to ensure movement)
            velocityY: fc.float({ min: 50, max: 200, noNaN: true }),
            // Which boundary to test
            boundary: fc.constantFrom('top', 'bottom'),
            // Delta time for update (long enough to ensure boundary hit)
            delta: fc.float({ min: 100, max: 500, noNaN: true })
          }),
          ({ x, size, velocityX, velocityY, boundary, delta }) => {
            const radius = size / 2;
            
            // Position bubble near the boundary
            let y;
            let initialVelocityY;
            
            if (boundary === 'top') {
              // Position near top boundary, moving up
              y = radius + 2;
              initialVelocityY = -Math.abs(velocityY); // Ensure moving up
            } else {
              // Position near bottom boundary, moving down
              y = WORLD_HEIGHT - radius - 2;
              initialVelocityY = Math.abs(velocityY); // Ensure moving down
            }
            
            const bubble = new AIBubble(mockScene, x, y, size, velocityX, initialVelocityY);
            const initialVelocityX = bubble.velocityX;
            
            // Update to trigger boundary collision
            bubble.update(delta);
            
            // Y velocity should have reversed (multiplied by -1)
            const velocityReversed = bubble.velocityY === -initialVelocityY;
            
            // X velocity should remain unchanged
            const xVelocityUnchanged = bubble.velocityX === initialVelocityX;
            
            // Position should be constrained within boundaries
            const withinBounds = 
              bubble.y - radius >= 0 &&
              bubble.y + radius <= WORLD_HEIGHT;
            
            return velocityReversed && xVelocityUnchanged && withinBounds;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reverse both velocities when hitting a corner', () => {
      // Feature: bubble-consumption-game, Property 11: AI Bubble Boundary Bouncing
      // **Validates: Requirements 4.3**

      fc.assert(
        fc.property(
          fc.record({
            // Bubble size
            size: fc.integer({ min: 10, max: 70 }),
            // Velocities (non-zero to ensure movement)
            velocityX: fc.float({ min: 50, max: 200, noNaN: true }),
            velocityY: fc.float({ min: 50, max: 200, noNaN: true }),
            // Which corner to test
            corner: fc.constantFrom('top-left', 'top-right', 'bottom-left', 'bottom-right'),
            // Delta time for update (long enough to ensure boundary hit)
            delta: fc.float({ min: 100, max: 500, noNaN: true })
          }),
          ({ size, velocityX, velocityY, corner, delta }) => {
            const radius = size / 2;
            
            // Position bubble near the corner
            let x, y, initialVelocityX, initialVelocityY;
            
            switch (corner) {
              case 'top-left':
                x = radius + 2;
                y = radius + 2;
                initialVelocityX = -Math.abs(velocityX); // Moving left
                initialVelocityY = -Math.abs(velocityY); // Moving up
                break;
              case 'top-right':
                x = WORLD_WIDTH - radius - 2;
                y = radius + 2;
                initialVelocityX = Math.abs(velocityX); // Moving right
                initialVelocityY = -Math.abs(velocityY); // Moving up
                break;
              case 'bottom-left':
                x = radius + 2;
                y = WORLD_HEIGHT - radius - 2;
                initialVelocityX = -Math.abs(velocityX); // Moving left
                initialVelocityY = Math.abs(velocityY); // Moving down
                break;
              case 'bottom-right':
                x = WORLD_WIDTH - radius - 2;
                y = WORLD_HEIGHT - radius - 2;
                initialVelocityX = Math.abs(velocityX); // Moving right
                initialVelocityY = Math.abs(velocityY); // Moving down
                break;
            }
            
            const bubble = new AIBubble(mockScene, x, y, size, initialVelocityX, initialVelocityY);
            
            // Update to trigger corner collision
            bubble.update(delta);
            
            // Both velocities should have reversed
            const xVelocityReversed = bubble.velocityX === -initialVelocityX;
            const yVelocityReversed = bubble.velocityY === -initialVelocityY;
            
            // Position should be constrained within boundaries
            const withinBounds = 
              bubble.x - radius >= 0 &&
              bubble.x + radius <= WORLD_WIDTH &&
              bubble.y - radius >= 0 &&
              bubble.y + radius <= WORLD_HEIGHT;
            
            return xVelocityReversed && yVelocityReversed && withinBounds;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain velocity magnitude after bouncing', () => {
      // Feature: bubble-consumption-game, Property 11: AI Bubble Boundary Bouncing
      // **Validates: Requirements 4.3**

      fc.assert(
        fc.property(
          fc.record({
            // Position near a boundary
            x: fc.float({ min: 10, max: 50, noNaN: true }),
            y: fc.float({ min: 100, max: 500, noNaN: true }),
            // Bubble size
            size: fc.integer({ min: 10, max: 70 }),
            // Velocity moving toward left boundary
            velocityX: fc.float({ min: -200, max: -10, noNaN: true }),
            velocityY: fc.float({ min: -100, max: 100, noNaN: true }),
            // Delta time
            delta: fc.float({ min: 10, max: 100, noNaN: true })
          }),
          ({ x, y, size, velocityX, velocityY, delta }) => {
            const bubble = new AIBubble(mockScene, x, y, size, velocityX, velocityY);
            
            const initialSpeedX = Math.abs(bubble.velocityX);
            const initialSpeedY = Math.abs(bubble.velocityY);
            
            // Update to trigger boundary collision
            bubble.update(delta);
            
            const finalSpeedX = Math.abs(bubble.velocityX);
            const finalSpeedY = Math.abs(bubble.velocityY);
            
            // Speed magnitude should remain the same (only direction changes)
            return finalSpeedX === initialSpeedX && finalSpeedY === initialSpeedY;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple consecutive bounces correctly', () => {
      // Feature: bubble-consumption-game, Property 11: AI Bubble Boundary Bouncing
      // **Validates: Requirements 4.3**

      fc.assert(
        fc.property(
          fc.record({
            // Start near left boundary
            x: fc.float({ min: 10, max: 30, noNaN: true }),
            y: fc.float({ min: 100, max: 500, noNaN: true }),
            // Bubble size
            size: fc.integer({ min: 10, max: 70 }),
            // Fast velocity to cause multiple bounces
            velocityX: fc.float({ min: -300, max: -100, noNaN: true }),
            velocityY: fc.float({ min: -50, max: 50, noNaN: true }),
            // Multiple update steps
            updates: fc.array(
              fc.float({ min: 10, max: 100, noNaN: true }),
              { minLength: 3, maxLength: 10 }
            )
          }),
          ({ x, y, size, velocityX, velocityY, updates }) => {
            const bubble = new AIBubble(mockScene, x, y, size, velocityX, velocityY);
            const radius = bubble.getRadius();
            
            // Apply multiple updates
            for (const delta of updates) {
              bubble.update(delta);
              
              // After each update, bubble should be within bounds
              const withinBounds = 
                bubble.x - radius >= 0 &&
                bubble.x + radius <= WORLD_WIDTH &&
                bubble.y - radius >= 0 &&
                bubble.y + radius <= WORLD_HEIGHT;
              
              if (!withinBounds) {
                return false;
              }
              
              // Velocity magnitude should remain constant
              const speedX = Math.abs(bubble.velocityX);
              const speedY = Math.abs(bubble.velocityY);
              
              if (speedX !== Math.abs(velocityX) || speedY !== Math.abs(velocityY)) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only reverse the perpendicular velocity component', () => {
      // Feature: bubble-consumption-game, Property 11: AI Bubble Boundary Bouncing
      // **Validates: Requirements 4.3**

      fc.assert(
        fc.property(
          fc.record({
            // Bubble size
            size: fc.integer({ min: 10, max: 70 }),
            // Velocity components
            velocityX: fc.float({ min: 50, max: 200, noNaN: true }),
            velocityY: fc.float({ min: 50, max: 200, noNaN: true }),
            // Which boundary to test
            boundary: fc.constantFrom('left', 'right', 'top', 'bottom'),
            // Delta time (long enough to ensure boundary hit)
            delta: fc.float({ min: 100, max: 500, noNaN: true })
          }),
          ({ size, velocityX, velocityY, boundary, delta }) => {
            const radius = size / 2;
            let x, y, initialVelocityX, initialVelocityY;
            
            // Position bubble to hit the specified boundary
            switch (boundary) {
              case 'left':
                x = radius + 2;
                y = WORLD_HEIGHT / 2;
                initialVelocityX = -Math.abs(velocityX);
                initialVelocityY = velocityY;
                break;
              case 'right':
                x = WORLD_WIDTH - radius - 2;
                y = WORLD_HEIGHT / 2;
                initialVelocityX = Math.abs(velocityX);
                initialVelocityY = velocityY;
                break;
              case 'top':
                x = WORLD_WIDTH / 2;
                y = radius + 2;
                initialVelocityX = velocityX;
                initialVelocityY = -Math.abs(velocityY);
                break;
              case 'bottom':
                x = WORLD_WIDTH / 2;
                y = WORLD_HEIGHT - radius - 2;
                initialVelocityX = velocityX;
                initialVelocityY = Math.abs(velocityY);
                break;
            }
            
            const bubble = new AIBubble(mockScene, x, y, size, initialVelocityX, initialVelocityY);
            
            // Update to trigger boundary collision
            bubble.update(delta);
            
            // Check that only the perpendicular component reversed
            if (boundary === 'left' || boundary === 'right') {
              // X is perpendicular to vertical boundaries
              const xReversed = bubble.velocityX === -initialVelocityX;
              const yUnchanged = bubble.velocityY === initialVelocityY;
              return xReversed && yUnchanged;
            } else {
              // Y is perpendicular to horizontal boundaries
              const yReversed = bubble.velocityY === -initialVelocityY;
              const xUnchanged = bubble.velocityX === initialVelocityX;
              return yReversed && xUnchanged;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: AI Bubble Constant Velocity', () => {
    it('should maintain constant velocity between boundary collisions', () => {
      // Feature: bubble-consumption-game, Property 12: AI Bubble Constant Velocity
      // **Validates: Requirements 4.2**

      fc.assert(
        fc.property(
          fc.record({
            // Position well away from all boundaries
            x: fc.float({ min: 200, max: 600, noNaN: true }),
            y: fc.float({ min: 200, max: 400, noNaN: true }),
            // Bubble size
            size: fc.integer({ min: 10, max: 70 }),
            // Velocity components (slow enough to not hit boundaries during test)
            velocityX: fc.float({ min: -50, max: 50, noNaN: true }),
            velocityY: fc.float({ min: -50, max: 50, noNaN: true }),
            // Multiple small update steps
            updates: fc.array(
              fc.float({ min: 10, max: 50, noNaN: true }),
              { minLength: 3, maxLength: 10 }
            )
          }),
          ({ x, y, size, velocityX, velocityY, updates }) => {
            const bubble = new AIBubble(mockScene, x, y, size, velocityX, velocityY);
            const radius = bubble.getRadius();
            
            const initialVelocityX = bubble.velocityX;
            const initialVelocityY = bubble.velocityY;
            
            // Apply multiple updates and verify velocity remains constant
            for (const delta of updates) {
              bubble.update(delta);
              
              // Check if bubble hit a boundary
              const hitBoundary = 
                bubble.x - radius <= 0 ||
                bubble.x + radius >= WORLD_WIDTH ||
                bubble.y - radius <= 0 ||
                bubble.y + radius >= WORLD_HEIGHT;
              
              // If no boundary was hit, velocity should remain constant
              if (!hitBoundary) {
                if (bubble.velocityX !== initialVelocityX || bubble.velocityY !== initialVelocityY) {
                  return false;
                }
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain velocity magnitude and direction across multiple frames without boundary collision', () => {
      // Feature: bubble-consumption-game, Property 12: AI Bubble Constant Velocity
      // **Validates: Requirements 4.2**

      fc.assert(
        fc.property(
          fc.record({
            // Position in center area, far from boundaries
            x: fc.float({ min: 300, max: 500, noNaN: true }),
            y: fc.float({ min: 250, max: 350, noNaN: true }),
            // Bubble size
            size: fc.integer({ min: 10, max: 40 }),
            // Very slow velocity to ensure no boundary hits
            velocityX: fc.float({ min: -20, max: 20, noNaN: true }),
            velocityY: fc.float({ min: -20, max: 20, noNaN: true }),
            // Number of frames to test
            frameCount: fc.integer({ min: 5, max: 15 })
          }),
          ({ x, y, size, velocityX, velocityY, frameCount }) => {
            const bubble = new AIBubble(mockScene, x, y, size, velocityX, velocityY);
            
            const initialVelocityX = bubble.velocityX;
            const initialVelocityY = bubble.velocityY;
            const initialSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            
            // Fixed delta time (16.67ms = 60 FPS)
            const delta = 16.67;
            
            // Update for multiple frames
            for (let i = 0; i < frameCount; i++) {
              bubble.update(delta);
              
              // Velocity components should remain exactly the same
              if (bubble.velocityX !== initialVelocityX || bubble.velocityY !== initialVelocityY) {
                return false;
              }
              
              // Speed (magnitude) should remain constant
              const currentSpeed = Math.sqrt(
                bubble.velocityX * bubble.velocityX + 
                bubble.velocityY * bubble.velocityY
              );
              
              if (Math.abs(currentSpeed - initialSpeed) > 0.001) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have identical velocity before and after update when not at boundary', () => {
      // Feature: bubble-consumption-game, Property 12: AI Bubble Constant Velocity
      // **Validates: Requirements 4.2**

      fc.assert(
        fc.property(
          fc.record({
            // Position guaranteed to be far from boundaries
            x: fc.constant(400), // Center X
            y: fc.constant(300), // Center Y
            // Small bubble size
            size: fc.integer({ min: 10, max: 30 }),
            // Any velocity
            velocityX: fc.float({ min: -100, max: 100, noNaN: true }),
            velocityY: fc.float({ min: -100, max: 100, noNaN: true }),
            // Very small delta to ensure no boundary hit
            delta: fc.float({ min: 1, max: 10, noNaN: true })
          }),
          ({ x, y, size, velocityX, velocityY, delta }) => {
            const bubble = new AIBubble(mockScene, x, y, size, velocityX, velocityY);
            
            const velocityBeforeX = bubble.velocityX;
            const velocityBeforeY = bubble.velocityY;
            
            bubble.update(delta);
            
            const velocityAfterX = bubble.velocityX;
            const velocityAfterY = bubble.velocityY;
            
            // Velocity should be identical before and after update
            return velocityBeforeX === velocityAfterX && velocityBeforeY === velocityAfterY;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve velocity vector across consecutive updates in open space', () => {
      // Feature: bubble-consumption-game, Property 12: AI Bubble Constant Velocity
      // **Validates: Requirements 4.2**

      fc.assert(
        fc.property(
          fc.record({
            // Bubble size
            size: fc.integer({ min: 10, max: 50 }),
            // Velocity components
            velocityX: fc.float({ min: -30, max: 30, noNaN: true }),
            velocityY: fc.float({ min: -30, max: 30, noNaN: true }),
            // Multiple update deltas
            deltas: fc.array(
              fc.float({ min: 5, max: 20, noNaN: true }),
              { minLength: 5, maxLength: 10 }
            )
          }),
          ({ size, velocityX, velocityY, deltas }) => {
            // Start at center to maximize distance from boundaries
            const bubble = new AIBubble(mockScene, 400, 300, size, velocityX, velocityY);
            const radius = bubble.getRadius();
            
            const originalVelocityX = bubble.velocityX;
            const originalVelocityY = bubble.velocityY;
            
            // Track velocity across all updates
            for (const delta of deltas) {
              const velocityBeforeX = bubble.velocityX;
              const velocityBeforeY = bubble.velocityY;
              
              bubble.update(delta);
              
              // Check if we're still away from boundaries
              const distanceFromLeft = bubble.x - radius;
              const distanceFromRight = WORLD_WIDTH - (bubble.x + radius);
              const distanceFromTop = bubble.y - radius;
              const distanceFromBottom = WORLD_HEIGHT - (bubble.y + radius);
              
              const minDistance = Math.min(
                distanceFromLeft,
                distanceFromRight,
                distanceFromTop,
                distanceFromBottom
              );
              
              // If we're still far from boundaries (at least 10px margin)
              if (minDistance > 10) {
                // Velocity should not have changed
                if (bubble.velocityX !== velocityBeforeX || bubble.velocityY !== velocityBeforeY) {
                  return false;
                }
                
                // Velocity should still match original
                if (bubble.velocityX !== originalVelocityX || bubble.velocityY !== originalVelocityY) {
                  return false;
                }
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
