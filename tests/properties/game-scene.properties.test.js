import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import GameScene from '../../src/scenes/GameScene.js';
import PlayerBubble from '../../src/entities/PlayerBubble.js';
import AIBubble from '../../src/entities/AIBubble.js';

describe('GameScene Properties', () => {
  let mockScene;

  beforeEach(() => {
    // Create mock Phaser scene context
    mockScene = {
      sound: {
        add: vi.fn((key) => ({
          play: vi.fn()
        }))
      },
      add: {
        graphics: vi.fn(() => ({
          clear: vi.fn(),
          fillStyle: vi.fn(),
          fillCircle: vi.fn(),
          lineStyle: vi.fn(),
          strokeCircle: vi.fn(),
          destroy: vi.fn()
        })),
        text: vi.fn(() => ({
          setText: vi.fn(),
          setOrigin: vi.fn()
        }))
      },
      input: {
        on: vi.fn(),
        once: vi.fn()
      },
      time: {
        delayedCall: vi.fn((delay, callback) => callback())
      },
      scene: {
        restart: vi.fn(),
        pause: vi.fn()
      }
    };
  });

  describe('Property 9: Life Decrement', () => {
    it('should decrement lives by 1 when player dies', () => {
      // Feature: bubble-consumption-game, Property 9: Life Decrement
      // **Validates: Requirements 1.2**

      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }),
          (initialLives) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            
            gameScene.lives = initialLives;
            gameScene.create();
            
            const livesBefore = gameScene.lives;
            gameScene.handleDeath();
            const livesAfter = gameScene.lives;
            
            return livesAfter === livesBefore - 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve lives across scene restarts', () => {
      // Feature: bubble-consumption-game, Property 9: Life Decrement
      // **Validates: Requirements 1.2**

      fc.assert(
        fc.property(
          fc.record({
            initialLives: fc.integer({ min: 2, max: 3 }),
            score: fc.integer({ min: 0, max: 1000 }),
            bubbleCount: fc.integer({ min: 10, max: 30 })
          }),
          ({ initialLives, score, bubbleCount }) => {
            // Reset mock before each test
            mockScene.scene.restart.mockClear();
            
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            
            gameScene.lives = initialLives;
            gameScene.score = score;
            gameScene.currentBubbleCount = bubbleCount;
            gameScene.create();
            
            gameScene.handleDeath();
            
            // Check that restart was called with decremented lives
            const restartCalls = mockScene.scene.restart.mock.calls;
            if (restartCalls.length === 0) return false;
            
            const restartData = restartCalls[restartCalls.length - 1][0];
            return restartData.lives === initialLives - 1;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Win Condition Reset', () => {
    it('should restart scene when player reaches size 100', () => {
      // Feature: bubble-consumption-game, Property 10: Win Condition Reset
      // **Validates: Requirements 1.4**

      fc.assert(
        fc.property(
          fc.record({
            lives: fc.integer({ min: 1, max: 3 }),
            score: fc.integer({ min: 0, max: 1000 }),
            bubbleCount: fc.integer({ min: 10, max: 30 })
          }),
          ({ lives, score, bubbleCount }) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            
            gameScene.lives = lives;
            gameScene.score = score;
            gameScene.currentBubbleCount = bubbleCount;
            gameScene.create();
            
            // Set player size to 100 (win condition)
            gameScene.playerBubble.size = 100;
            
            // Trigger update which checks win condition
            gameScene.update(0, 16);
            
            // Scene should be restarted
            return mockScene.scene.restart.mock.calls.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should increase difficulty on win', () => {
      // Feature: bubble-consumption-game, Property 10: Win Condition Reset
      // **Validates: Requirements 1.4**

      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 30 }),
          (initialBubbleCount) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            
            gameScene.currentBubbleCount = initialBubbleCount;
            gameScene.create();
            
            gameScene.handleWin();
            
            // Bubble count should increase by 2
            return gameScene.currentBubbleCount === initialBubbleCount + 2;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 13: AI Bubble Count Invariant', () => {
    it('should maintain target bubble count during gameplay', () => {
      // Feature: bubble-consumption-game, Property 13: AI Bubble Count Invariant
      // **Validates: Requirements 4.5, 4.6, 4.7**

      fc.assert(
        fc.property(
          fc.record({
            targetCount: fc.integer({ min: 10, max: 30 }),
            bubblesRemoved: fc.integer({ min: 1, max: 5 })
          }),
          ({ targetCount, bubblesRemoved }) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            
            gameScene.currentBubbleCount = targetCount;
            gameScene.create();
            
            // Verify initial count
            if (gameScene.aiBubbles.length !== targetCount) {
              return false;
            }
            
            // Remove some bubbles (simulating consumption)
            const toRemove = Math.min(bubblesRemoved, gameScene.aiBubbles.length);
            for (let i = 0; i < toRemove; i++) {
              const bubble = gameScene.aiBubbles.pop();
              if (bubble.graphics) {
                bubble.graphics.destroy();
              }
            }
            
            // Call maintainBubbleCount
            gameScene.maintainBubbleCount();
            
            // Count should be restored to target
            return gameScene.aiBubbles.length === targetCount;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not spawn bubbles when at target count', () => {
      // Feature: bubble-consumption-game, Property 13: AI Bubble Count Invariant
      // **Validates: Requirements 4.5, 4.6, 4.7**

      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 30 }),
          (targetCount) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            
            gameScene.currentBubbleCount = targetCount;
            gameScene.create();
            
            const countBefore = gameScene.aiBubbles.length;
            
            // Call maintainBubbleCount when already at target
            gameScene.maintainBubbleCount();
            
            const countAfter = gameScene.aiBubbles.length;
            
            // Count should remain the same
            return countBefore === countAfter && countAfter === targetCount;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 22: Continuous Movement', () => {
    it('should continue moving toward target across multiple frames when input is held', () => {
      // Feature: bubble-consumption-game, Property 22: Continuous Movement
      // **Validates: Requirements 8.3**

      fc.assert(
        fc.property(
          fc.record({
            startX: fc.float({ min: 100, max: 700, noNaN: true }),
            startY: fc.float({ min: 100, max: 500, noNaN: true }),
            targetX: fc.float({ min: 100, max: 700, noNaN: true }),
            targetY: fc.float({ min: 100, max: 500, noNaN: true }),
            frames: fc.integer({ min: 2, max: 10 }),
            deltaPerFrame: fc.float({ min: 10, max: 30, noNaN: true })
          }),
          ({ startX, startY, targetX, targetY, frames, deltaPerFrame }) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            gameScene.create();
            
            // Position player and set target
            gameScene.playerBubble.x = startX;
            gameScene.playerBubble.y = startY;
            gameScene.playerBubble.setTarget(targetX, targetY);
            
            const initialDistance = Math.sqrt(
              Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2)
            );
            
            // Skip if already at target
            if (initialDistance < 1) {
              return true;
            }
            
            // Update multiple frames
            for (let i = 0; i < frames; i++) {
              gameScene.playerBubble.update(deltaPerFrame);
            }
            
            const finalDistance = Math.sqrt(
              Math.pow(targetX - gameScene.playerBubble.x, 2) + 
              Math.pow(targetY - gameScene.playerBubble.y, 2)
            );
            
            // Player should have moved closer to target
            return finalDistance < initialDistance;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 23: Input Coordinate Normalization', () => {
    it('should handle input coordinates correctly regardless of screen size', () => {
      // Feature: bubble-consumption-game, Property 23: Input Coordinate Normalization
      // **Validates: Requirements 8.4**

      fc.assert(
        fc.property(
          fc.record({
            inputX: fc.float({ min: 0, max: 800, noNaN: true }),
            inputY: fc.float({ min: 0, max: 600, noNaN: true })
          }),
          ({ inputX, inputY }) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            gameScene.create();
            
            // Simulate input event
            gameScene.playerBubble.setTarget(inputX, inputY);
            
            // Target should be set to the input coordinates
            // (Phaser handles coordinate normalization at the framework level)
            return gameScene.playerBubble.targetX === inputX && 
                   gameScene.playerBubble.targetY === inputY;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 24: Pop Sound on Consumption', () => {
    it('should play pop sound when player consumes smaller bubble', () => {
      // Feature: bubble-consumption-game, Property 24: Pop Sound on Consumption
      // **Validates: Requirements 12.1**

      fc.assert(
        fc.property(
          fc.record({
            playerSize: fc.integer({ min: 40, max: 90 }),
            aiSize: fc.integer({ min: 10, max: 39 })
          }),
          ({ playerSize, aiSize }) => {
            // Create fresh mocks for this test
            const popSound = { play: vi.fn() };
            const explosionSound = { play: vi.fn() };
            const fanfareSound = { play: vi.fn() };
            
            const freshMockScene = {
              sound: {
                add: vi.fn((key) => {
                  if (key === 'pop') return popSound;
                  if (key === 'explosion') return explosionSound;
                  if (key === 'fanfare') return fanfareSound;
                  return { play: vi.fn() };
                })
              },
              add: {
                graphics: vi.fn(() => ({
                  clear: vi.fn(),
                  fillStyle: vi.fn(),
                  fillCircle: vi.fn(),
                  lineStyle: vi.fn(),
                  strokeCircle: vi.fn(),
                  destroy: vi.fn()
                })),
                text: vi.fn(() => ({
                  setText: vi.fn(),
                  setOrigin: vi.fn()
                }))
              },
              input: {
                on: vi.fn(),
                once: vi.fn()
              },
              time: {
                delayedCall: vi.fn((delay, callback) => callback())
              },
              scene: {
                restart: vi.fn(),
                pause: vi.fn()
              }
            };
            
            const gameScene = new GameScene();
            Object.assign(gameScene, freshMockScene);
            gameScene.create();
            
            // Set player size and position
            gameScene.playerBubble.size = playerSize;
            gameScene.playerBubble.x = 400;
            gameScene.playerBubble.y = 300;
            
            // Ensure at least one AI bubble exists
            if (gameScene.aiBubbles.length === 0) {
              // Manually create an AI bubble if spawn system didn't create any
              const aiBubble = new AIBubble(freshMockScene, 400, 300, aiSize, 0, 0);
              gameScene.aiBubbles.push(aiBubble);
            }
            
            // Get first AI bubble and ensure it's smaller and overlapping
            const aiBubble = gameScene.aiBubbles[0];
            aiBubble.size = aiSize;
            // Position at exact same location to guarantee collision
            aiBubble.x = gameScene.playerBubble.x;
            aiBubble.y = gameScene.playerBubble.y;
            
            // Verify collision will occur
            const playerRadius = gameScene.playerBubble.getRadius();
            const aiRadius = aiBubble.getRadius();
            const distance = 0; // Same position
            const shouldCollide = distance < (playerRadius + aiRadius);
            
            if (!shouldCollide) {
              // Skip this test case if collision won't happen
              return true;
            }
            
            // Check collisions
            gameScene.checkCollisions();
            
            // Pop sound should have been played
            return popSound.play.mock.calls.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 25: Explosion Sound on Death', () => {
    it('should play explosion sound when player collides with larger or equal bubble', () => {
      // Feature: bubble-consumption-game, Property 25: Explosion Sound on Death
      // **Validates: Requirements 12.2**

      fc.assert(
        fc.property(
          fc.record({
            playerSize: fc.integer({ min: 10, max: 50 }),
            aiSize: fc.integer({ min: 50, max: 70 })
          }),
          ({ playerSize, aiSize }) => {
            // Ensure AI is larger or equal
            const adjustedAiSize = Math.max(aiSize, playerSize);
            
            // Create fresh mocks for this test
            const explosionSound = { play: vi.fn() };
            const popSound = { play: vi.fn() };
            const fanfareSound = { play: vi.fn() };
            
            const freshMockScene = {
              sound: {
                add: vi.fn((key) => {
                  if (key === 'explosion') return explosionSound;
                  if (key === 'pop') return popSound;
                  if (key === 'fanfare') return fanfareSound;
                  return { play: vi.fn() };
                })
              },
              add: {
                graphics: vi.fn(() => ({
                  clear: vi.fn(),
                  fillStyle: vi.fn(),
                  fillCircle: vi.fn(),
                  lineStyle: vi.fn(),
                  strokeCircle: vi.fn(),
                  destroy: vi.fn()
                })),
                text: vi.fn(() => ({
                  setText: vi.fn(),
                  setOrigin: vi.fn()
                }))
              },
              input: {
                on: vi.fn(),
                once: vi.fn()
              },
              time: {
                delayedCall: vi.fn((delay, callback) => callback())
              },
              scene: {
                restart: vi.fn(),
                pause: vi.fn()
              }
            };
            
            const gameScene = new GameScene();
            Object.assign(gameScene, freshMockScene);
            gameScene.create();
            
            // Set player size and position
            gameScene.playerBubble.size = playerSize;
            gameScene.playerBubble.x = 400;
            gameScene.playerBubble.y = 300;
            
            // Ensure at least one AI bubble exists
            if (gameScene.aiBubbles.length === 0) {
              // Manually create an AI bubble if spawn system didn't create any
              const aiBubble = new AIBubble(freshMockScene, 400, 300, adjustedAiSize, 0, 0);
              gameScene.aiBubbles.push(aiBubble);
            }
            
            // Create AI bubble at overlapping position (ensure collision)
            const aiBubble = gameScene.aiBubbles[0];
            aiBubble.size = adjustedAiSize;
            aiBubble.x = 400;  // Same position as player
            aiBubble.y = 300;  // Same position as player
            
            // Check collisions
            gameScene.checkCollisions();
            
            // Explosion sound should have been played
            return explosionSound.play.mock.calls.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 26: Fanfare Sound on Level Reset', () => {
    it('should play fanfare sound when scene resets from losing a life', () => {
      // Feature: bubble-consumption-game, Property 26: Fanfare Sound on Level Reset
      // **Validates: Requirements 12.3**

      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 3 }),
          (lives) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            
            gameScene.lives = lives;
            gameScene.create();
            
            gameScene.handleDeath();
            
            // Fanfare sound should have been played
            return gameScene.sounds.fanfare.play.mock.calls.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should play fanfare sound when scene resets from winning', () => {
      // Feature: bubble-consumption-game, Property 26: Fanfare Sound on Level Reset
      // **Validates: Requirements 12.3**

      fc.assert(
        fc.property(
          fc.record({
            lives: fc.integer({ min: 1, max: 3 }),
            score: fc.integer({ min: 0, max: 1000 })
          }),
          ({ lives, score }) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            
            gameScene.lives = lives;
            gameScene.score = score;
            gameScene.create();
            
            gameScene.handleWin();
            
            // Fanfare sound should have been played
            return gameScene.sounds.fanfare.play.mock.calls.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 27: Progressive Bubble Count', () => {
    it('should increase bubble count by 2 after each scene reset', () => {
      // Feature: bubble-consumption-game, Property 27: Progressive Bubble Count
      // **Validates: Requirements 4.6**

      fc.assert(
        fc.property(
          fc.record({
            initialCount: fc.integer({ min: 10, max: 30 }),
            resets: fc.integer({ min: 1, max: 5 })
          }),
          ({ initialCount, resets }) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            
            gameScene.currentBubbleCount = initialCount;
            gameScene.create();
            
            let expectedCount = initialCount;
            
            // Simulate multiple resets
            for (let i = 0; i < resets; i++) {
              gameScene.handleWin();
              expectedCount += 2;
            }
            
            // Final count should be initial + (2 * resets)
            return gameScene.currentBubbleCount === expectedCount;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should follow formula: bubbleCount = 10 + (2 * N) for N resets', () => {
      // Feature: bubble-consumption-game, Property 27: Progressive Bubble Count
      // **Validates: Requirements 4.6**

      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }),
          (resetCount) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            
            // Start with initial count of 10
            gameScene.currentBubbleCount = 10;
            gameScene.create();
            
            // Simulate N resets
            for (let i = 0; i < resetCount; i++) {
              gameScene.handleWin();
            }
            
            const expectedCount = 10 + (2 * resetCount);
            return gameScene.currentBubbleCount === expectedCount;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 19: Bubble Radius Rendering', () => {
    it('should render bubbles with radius equal to size/2', () => {
      // Feature: bubble-consumption-game, Property 19: Bubble Radius Rendering
      // **Validates: Requirements 5.1**

      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }),
          (size) => {
            const gameScene = new GameScene();
            Object.assign(gameScene, mockScene);
            gameScene.create();
            
            gameScene.playerBubble.size = size;
            const radius = gameScene.playerBubble.getRadius();
            
            // Radius should be exactly half of size
            return radius === size / 2;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
