import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import PlayerBubble from '../../src/entities/PlayerBubble.js';

describe('Consumption Properties', () => {
  const mockScene = {};

  /**
   * Property 6: Growth Calculation
   * For any consumption event where the player consumes an AI bubble of size S,
   * the player's new size should equal min(100, oldSize + floor(sqrt(S))).
   * 
   * **Validates: Requirements 3.4**
   */
  it('Property 6: Growth Calculation', () => {
    fc.assert(
      fc.property(
        fc.record({
          initialSize: fc.integer({ min: 10, max: 100 }),
          consumedSize: fc.integer({ min: 0, max: 100 })
        }),
        ({ initialSize, consumedSize }) => {
          const bubble = new PlayerBubble(mockScene, 400, 300, initialSize);
          const oldSize = bubble.size;
          
          bubble.grow(consumedSize);
          
          const expectedGrowth = Math.floor(Math.sqrt(consumedSize));
          const expectedSize = Math.min(100, oldSize + expectedGrowth);
          
          return bubble.size === expectedSize;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Area Conservation
   * For any bubble consumption event, the total area (sum of πr² for all bubbles)
   * before consumption should equal the total area after consumption.
   * 
   * **Validates: Requirements 3.5**
   */
  it('Property 7: Area Conservation', () => {
    fc.assert(
      fc.property(
        fc.record({
          playerSize: fc.integer({ min: 20, max: 99 }),
          consumedSize: fc.integer({ min: 10, max: 70 })
        }).filter(({ playerSize, consumedSize }) => playerSize > consumedSize),
        ({ playerSize, consumedSize }) => {
          const bubble = new PlayerBubble(mockScene, 400, 300, playerSize);
          
          // Calculate total area before consumption
          const playerRadiusBefore = playerSize / 2;
          const consumedRadius = consumedSize / 2;
          const totalAreaBefore = Math.PI * (playerRadiusBefore ** 2) + Math.PI * (consumedRadius ** 2);
          
          // Perform consumption
          bubble.grow(consumedSize);
          
          // Calculate total area after consumption
          const playerRadiusAfter = bubble.size / 2;
          const totalAreaAfter = Math.PI * (playerRadiusAfter ** 2);
          
          // Area should be conserved (allowing for small floating point errors)
          const areaDifference = Math.abs(totalAreaAfter - totalAreaBefore);
          const tolerance = 0.01; // Allow 0.01 square pixels difference due to floating point
          
          return areaDifference < tolerance;
        }
      ),
      { numRuns: 100 }
    );
  });
});
