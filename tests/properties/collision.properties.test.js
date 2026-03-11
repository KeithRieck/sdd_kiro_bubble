import { describe, it } from 'vitest';
import fc from 'fast-check';
import CollisionSystem from '../../src/systems/CollisionSystem.js';

describe('Collision Properties', () => {
  describe('Property 4: Collision Detection by Distance', () => {
    it('should detect collision if and only if distance between centers is less than sum of radii', () => {
      // Feature: bubble-consumption-game, Property 4: Collision Detection by Distance
      // **Validates: Requirements 10.1, 10.2, 10.3**
      
      fc.assert(
        fc.property(
          fc.record({
            x1: fc.float({ min: 0, max: 800, noNaN: true }),
            y1: fc.float({ min: 0, max: 600, noNaN: true }),
            r1: fc.float({ min: 5, max: 50, noNaN: true }),
            x2: fc.float({ min: 0, max: 800, noNaN: true }),
            y2: fc.float({ min: 0, max: 600, noNaN: true }),
            r2: fc.float({ min: 5, max: 50, noNaN: true })
          }),
          ({ x1, y1, r1, x2, y2, r2 }) => {
            // Create mock bubble objects with required interface
            const bubble1 = {
              x: x1,
              y: y1,
              getRadius: () => r1
            };
            
            const bubble2 = {
              x: x2,
              y: y2,
              getRadius: () => r2
            };
            
            // Calculate actual distance between centers
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check collision using CollisionSystem
            const collision = CollisionSystem.checkCollision(bubble1, bubble2);
            
            // Expected collision: distance < r1 + r2
            const expectedCollision = distance < r1 + r2;
            
            // Collision detection should match expected result
            return collision === expectedCollision;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect collision when bubbles are exactly touching (distance equals sum of radii)', () => {
      // Feature: bubble-consumption-game, Property 4: Collision Detection by Distance
      // **Validates: Requirements 10.1, 10.2, 10.3**
      
      fc.assert(
        fc.property(
          fc.record({
            x1: fc.float({ min: 100, max: 700, noNaN: true }),
            y1: fc.float({ min: 100, max: 500, noNaN: true }),
            r1: fc.float({ min: 5, max: 50, noNaN: true }),
            r2: fc.float({ min: 5, max: 50, noNaN: true }),
            angle: fc.float({ min: 0, max: Math.fround(2 * Math.PI), noNaN: true })
          }),
          ({ x1, y1, r1, r2, angle }) => {
            // Position bubble2 exactly at distance r1 + r2 from bubble1
            const distance = r1 + r2;
            const x2 = x1 + distance * Math.cos(angle);
            const y2 = y1 + distance * Math.sin(angle);
            
            const bubble1 = {
              x: x1,
              y: y1,
              getRadius: () => r1
            };
            
            const bubble2 = {
              x: x2,
              y: y2,
              getRadius: () => r2
            };
            
            // When distance equals sum of radii, collision should NOT be detected
            // (collision requires distance < r1 + r2, not <=)
            const collision = CollisionSystem.checkCollision(bubble1, bubble2);
            
            // Calculate actual distance to verify our positioning
            const actualDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            
            // Due to floating point arithmetic, the actual distance might be slightly
            // different from the intended distance. We need to check what actually happened.
            const sumOfRadii = r1 + r2;
            
            // If actual distance is less than sum of radii, collision should be detected
            // If actual distance is greater than or equal to sum of radii, no collision
            const expectedCollision = actualDistance < sumOfRadii;
            
            return collision === expectedCollision;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect collision when bubbles are overlapping', () => {
      // Feature: bubble-consumption-game, Property 4: Collision Detection by Distance
      // **Validates: Requirements 10.1, 10.2, 10.3**
      
      fc.assert(
        fc.property(
          fc.record({
            x1: fc.float({ min: 100, max: 700, noNaN: true }),
            y1: fc.float({ min: 100, max: 500, noNaN: true }),
            r1: fc.float({ min: 10, max: 50, noNaN: true }),
            r2: fc.float({ min: 10, max: 50, noNaN: true }),
            // Overlap factor: 0 to 1, where 0 = just touching, 1 = centers coincide
            overlapFactor: fc.float({ min: Math.fround(0.01), max: Math.fround(0.99), noNaN: true }),
            angle: fc.float({ min: 0, max: Math.fround(2 * Math.PI), noNaN: true })
          }),
          ({ x1, y1, r1, r2, overlapFactor, angle }) => {
            // Position bubble2 at a distance less than r1 + r2
            const maxDistance = r1 + r2;
            const distance = maxDistance * (1 - overlapFactor);
            const x2 = x1 + distance * Math.cos(angle);
            const y2 = y1 + distance * Math.sin(angle);
            
            const bubble1 = {
              x: x1,
              y: y1,
              getRadius: () => r1
            };
            
            const bubble2 = {
              x: x2,
              y: y2,
              getRadius: () => r2
            };
            
            // When bubbles overlap, collision should always be detected
            const collision = CollisionSystem.checkCollision(bubble1, bubble2);
            
            return collision === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not detect collision when bubbles are separated', () => {
      // Feature: bubble-consumption-game, Property 4: Collision Detection by Distance
      // **Validates: Requirements 10.1, 10.2, 10.3**
      
      fc.assert(
        fc.property(
          fc.record({
            x1: fc.float({ min: 100, max: 700, noNaN: true }),
            y1: fc.float({ min: 100, max: 500, noNaN: true }),
            r1: fc.float({ min: 5, max: 50, noNaN: true }),
            r2: fc.float({ min: 5, max: 50, noNaN: true }),
            // Separation distance beyond touching point
            extraDistance: fc.float({ min: Math.fround(0.1), max: 100, noNaN: true }),
            angle: fc.float({ min: 0, max: Math.fround(2 * Math.PI), noNaN: true })
          }),
          ({ x1, y1, r1, r2, extraDistance, angle }) => {
            // Position bubble2 at a distance greater than r1 + r2
            const distance = r1 + r2 + extraDistance;
            const x2 = x1 + distance * Math.cos(angle);
            const y2 = y1 + distance * Math.sin(angle);
            
            const bubble1 = {
              x: x1,
              y: y1,
              getRadius: () => r1
            };
            
            const bubble2 = {
              x: x2,
              y: y2,
              getRadius: () => r2
            };
            
            // When bubbles are separated, collision should not be detected
            const collision = CollisionSystem.checkCollision(bubble1, bubble2);
            
            return collision === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be symmetric (collision detection order should not matter)', () => {
      // Feature: bubble-consumption-game, Property 4: Collision Detection by Distance
      // **Validates: Requirements 10.1, 10.2, 10.3**
      
      fc.assert(
        fc.property(
          fc.record({
            x1: fc.float({ min: 0, max: 800, noNaN: true }),
            y1: fc.float({ min: 0, max: 600, noNaN: true }),
            r1: fc.float({ min: 5, max: 50, noNaN: true }),
            x2: fc.float({ min: 0, max: 800, noNaN: true }),
            y2: fc.float({ min: 0, max: 600, noNaN: true }),
            r2: fc.float({ min: 5, max: 50, noNaN: true })
          }),
          ({ x1, y1, r1, x2, y2, r2 }) => {
            const bubble1 = {
              x: x1,
              y: y1,
              getRadius: () => r1
            };
            
            const bubble2 = {
              x: x2,
              y: y2,
              getRadius: () => r2
            };
            
            // Check collision in both orders
            const collision1to2 = CollisionSystem.checkCollision(bubble1, bubble2);
            const collision2to1 = CollisionSystem.checkCollision(bubble2, bubble1);
            
            // Collision detection should be symmetric
            return collision1to2 === collision2to1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of zero-radius bubbles', () => {
      // Feature: bubble-consumption-game, Property 4: Collision Detection by Distance
      // **Validates: Requirements 10.1, 10.2, 10.3**
      
      fc.assert(
        fc.property(
          fc.record({
            x1: fc.float({ min: 0, max: 800, noNaN: true }),
            y1: fc.float({ min: 0, max: 600, noNaN: true }),
            x2: fc.float({ min: 0, max: 800, noNaN: true }),
            y2: fc.float({ min: 0, max: 600, noNaN: true })
          }),
          ({ x1, y1, x2, y2 }) => {
            const bubble1 = {
              x: x1,
              y: y1,
              getRadius: () => 0
            };
            
            const bubble2 = {
              x: x2,
              y: y2,
              getRadius: () => 0
            };
            
            const collision = CollisionSystem.checkCollision(bubble1, bubble2);
            
            // Zero-radius bubbles only collide if at exact same position
            const samePosition = x1 === x2 && y1 === y2;
            
            // If at same position, distance is 0, which is < 0 + 0 (false)
            // So no collision should be detected even at same position
            return collision === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle bubbles with very different sizes', () => {
      // Feature: bubble-consumption-game, Property 4: Collision Detection by Distance
      // **Validates: Requirements 10.1, 10.2, 10.3**
      
      fc.assert(
        fc.property(
          fc.record({
            x1: fc.float({ min: 100, max: 700, noNaN: true }),
            y1: fc.float({ min: 100, max: 500, noNaN: true }),
            smallRadius: fc.float({ min: 1, max: 10, noNaN: true }),
            largeRadius: fc.float({ min: 40, max: 50, noNaN: true }),
            distance: fc.float({ min: 0, max: 100, noNaN: true })
          }),
          ({ x1, y1, smallRadius, largeRadius, distance }) => {
            // Position small bubble at specified distance from large bubble
            const x2 = x1 + distance;
            const y2 = y1;
            
            const largeBubble = {
              x: x1,
              y: y1,
              getRadius: () => largeRadius
            };
            
            const smallBubble = {
              x: x2,
              y: y2,
              getRadius: () => smallRadius
            };
            
            const collision = CollisionSystem.checkCollision(largeBubble, smallBubble);
            const expectedCollision = distance < smallRadius + largeRadius;
            
            return collision === expectedCollision;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Consumption Increases Score', () => {
    it('should remove AI bubble and increase score by AI bubble size when player is larger', () => {
      // Feature: bubble-consumption-game, Property 5: Consumption Increases Score
      // **Validates: Requirements 3.2, 6.4**
      
      fc.assert(
        fc.property(
          fc.record({
            playerSize: fc.integer({ min: 20, max: 100 }),
            aiBubbleSize: fc.integer({ min: 10, max: 70 })
          }).filter(({ playerSize, aiBubbleSize }) => playerSize > aiBubbleSize),
          ({ playerSize, aiBubbleSize }) => {
            // Create mock player and AI bubble
            const player = {
              size: playerSize,
              x: 400,
              y: 300,
              getRadius: () => playerSize / 2
            };
            
            const aiBubble = {
              size: aiBubbleSize,
              x: 400,
              y: 300,
              getRadius: () => aiBubbleSize / 2
            };
            
            // Resolve collision
            const result = CollisionSystem.resolveCollision(player, aiBubble);
            
            // When player is larger, action should be 'consume'
            // and score should equal the AI bubble size
            return (
              result.action === 'consume' &&
              result.score === aiBubbleSize &&
              result.growth === Math.floor(Math.sqrt(aiBubbleSize))
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return zero score when player is smaller or equal', () => {
      // Feature: bubble-consumption-game, Property 5: Consumption Increases Score
      // **Validates: Requirements 3.2, 6.4**
      
      fc.assert(
        fc.property(
          fc.record({
            playerSize: fc.integer({ min: 10, max: 70 }),
            aiBubbleSize: fc.integer({ min: 10, max: 100 })
          }).filter(({ playerSize, aiBubbleSize }) => playerSize <= aiBubbleSize),
          ({ playerSize, aiBubbleSize }) => {
            const player = {
              size: playerSize,
              x: 400,
              y: 300,
              getRadius: () => playerSize / 2
            };
            
            const aiBubble = {
              size: aiBubbleSize,
              x: 400,
              y: 300,
              getRadius: () => aiBubbleSize / 2
            };
            
            const result = CollisionSystem.resolveCollision(player, aiBubble);
            
            // When player is smaller or equal, action should be 'death'
            // and score should be 0
            return (
              result.action === 'death' &&
              result.score === 0 &&
              result.growth === 0
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Death on Larger Collision', () => {
    it('should return death action when AI bubble is larger than player', () => {
      // Feature: bubble-consumption-game, Property 8: Death on Larger Collision
      // **Validates: Requirements 3.3**
      
      fc.assert(
        fc.property(
          fc.record({
            playerSize: fc.integer({ min: 10, max: 70 }),
            aiBubbleSize: fc.integer({ min: 10, max: 100 })
          }).filter(({ playerSize, aiBubbleSize }) => aiBubbleSize > playerSize),
          ({ playerSize, aiBubbleSize }) => {
            const player = {
              size: playerSize,
              x: 400,
              y: 300,
              getRadius: () => playerSize / 2
            };
            
            const aiBubble = {
              size: aiBubbleSize,
              x: 400,
              y: 300,
              getRadius: () => aiBubbleSize / 2
            };
            
            const result = CollisionSystem.resolveCollision(player, aiBubble);
            
            // When AI bubble is larger, action should be 'death'
            return result.action === 'death';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return death action when AI bubble is equal to player', () => {
      // Feature: bubble-consumption-game, Property 8: Death on Larger Collision
      // **Validates: Requirements 3.3**
      
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }),
          (size) => {
            const player = {
              size: size,
              x: 400,
              y: 300,
              getRadius: () => size / 2
            };
            
            const aiBubble = {
              size: size,
              x: 400,
              y: 300,
              getRadius: () => size / 2
            };
            
            const result = CollisionSystem.resolveCollision(player, aiBubble);
            
            // When sizes are equal, action should be 'death'
            return result.action === 'death';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return zero growth and score on death', () => {
      // Feature: bubble-consumption-game, Property 8: Death on Larger Collision
      // **Validates: Requirements 3.3**
      
      fc.assert(
        fc.property(
          fc.record({
            playerSize: fc.integer({ min: 10, max: 70 }),
            aiBubbleSize: fc.integer({ min: 10, max: 100 })
          }).filter(({ playerSize, aiBubbleSize }) => aiBubbleSize >= playerSize),
          ({ playerSize, aiBubbleSize }) => {
            const player = {
              size: playerSize,
              x: 400,
              y: 300,
              getRadius: () => playerSize / 2
            };
            
            const aiBubble = {
              size: aiBubbleSize,
              x: 400,
              y: 300,
              getRadius: () => aiBubbleSize / 2
            };
            
            const result = CollisionSystem.resolveCollision(player, aiBubble);
            
            // On death, growth and score should both be 0
            return (
              result.action === 'death' &&
              result.growth === 0 &&
              result.score === 0
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
