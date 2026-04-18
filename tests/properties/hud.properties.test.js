import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import HUD from '../../src/ui/HUD.js';

describe('HUD Properties', () => {
  let mockScene;
  let mockScoreText;
  let mockLivesText;
  let mockLevelText;
  let mockGameOverText;
  let capturedStyles;

  beforeEach(() => {
    capturedStyles = [];

    mockScoreText = {
      setText: vi.fn()
    };

    mockLivesText = {
      setText: vi.fn()
    };

    mockLevelText = {
      setText: vi.fn()
    };

    mockGameOverText = {
      setOrigin: vi.fn()
    };

    mockScene = {
      add: {
        text: vi.fn((x, y, text, style) => {
          // Capture the style for verification
          capturedStyles.push({ x, y, text, style });
          
          if (text === 'Score: 0') return mockScoreText;
          if (text === 'Lives: 3') return mockLivesText;
          if (text === 'Level: 1') return mockLevelText;
          if (text.includes('Game Over')) return mockGameOverText;
          return mockGameOverText;
        })
      },
      input: {
        once: vi.fn()
      },
      scene: {
        restart: vi.fn()
      }
    };
  });

  it('Property 33: HUD Font Specification', () => {
    // Feature: bubble-consumption-game, Property 33: HUD Font Specification
    // For any game state, the score and lives count should be displayed in 24 point Arial or Helvetica font.
    // Validates: Requirements 6.3
    
    fc.assert(
      fc.property(
        fc.record({
          // We don't need random inputs here since font is constant
          // But we can test that it holds across multiple HUD creations
          dummy: fc.constant(true)
        }),
        () => {
          // Reset captured styles
          capturedStyles = [];
          mockScene.add.text.mockClear();
          
          // Create HUD
          const hud = new HUD(mockScene);
          
          // Find score and lives text styles
          const scoreStyle = capturedStyles.find(s => s.text === 'Score: 0')?.style;
          const livesStyle = capturedStyles.find(s => s.text === 'Lives: 3')?.style;
          
          // Verify both exist
          expect(scoreStyle).toBeDefined();
          expect(livesStyle).toBeDefined();
          
          // Verify font size is 24pt (not 24px)
          expect(scoreStyle.fontSize).toBe('24pt');
          expect(livesStyle.fontSize).toBe('24pt');
          
          // Verify font family includes Arial or Helvetica
          const scoreFontFamily = scoreStyle.fontFamily || '';
          const livesFontFamily = livesStyle.fontFamily || '';
          
          const hasValidFont = (fontFamily) => {
            return fontFamily.includes('Arial') || fontFamily.includes('Helvetica');
          };
          
          expect(hasValidFont(scoreFontFamily)).toBe(true);
          expect(hasValidFont(livesFontFamily)).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20: Score Always Visible', () => {
    // Feature: bubble-consumption-game, Property 20: Score Always Visible
    // For any game state, the score display element should exist and be visible.
    // Validates: Requirements 1.5
    
    fc.assert(
      fc.property(
        fc.record({
          score: fc.integer({ min: 0, max: 10000 }),
          lives: fc.integer({ min: 0, max: 10 })
        }),
        ({ score, lives }) => {
          // Reset mocks
          mockScene.add.text.mockClear();
          capturedStyles = [];
          
          // Create HUD
          const hud = new HUD(mockScene);
          
          // Verify score text was created
          expect(hud.scoreText).toBeDefined();
          expect(hud.scoreText).not.toBeNull();
          
          // Update with random score and lives
          hud.render(score, lives, 1);
          
          // Verify score text still exists and was updated
          expect(hud.scoreText).toBeDefined();
          expect(mockScoreText.setText).toHaveBeenCalledWith(`Score: ${score}`);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 21: Game Over Display', () => {
    // Feature: bubble-consumption-game, Property 21: Game Over Display
    // For any game state where lives equal 0, the final score should be displayed 
    // and a restart option should be available (via stopGame in GameScene).
    // Validates: Requirements 6.2, 6.3
    
    fc.assert(
      fc.property(
        fc.record({
          finalScore: fc.integer({ min: 0, max: 10000 })
        }),
        ({ finalScore }) => {
          // Reset mocks
          mockScene.add.text.mockClear();
          mockScene.input.once.mockClear();
          capturedStyles = [];
          
          // Create HUD
          const hud = new HUD(mockScene);
          
          // Show game over
          hud.showGameOver(finalScore);
          
          // Verify game over text was created
          expect(hud.gameOverText).toBeDefined();
          expect(hud.gameOverText).not.toBeNull();
          
          // Verify final score is displayed
          const gameOverCall = capturedStyles.find(s => s.text.includes('Game Over'));
          expect(gameOverCall).toBeDefined();
          expect(gameOverCall.text).toContain(`Final Score: ${finalScore}`);
          
          // Restart is now handled by stopGame() in GameScene, not HUD
          // HUD showGameOver should NOT register a pointerdown listener
          expect(mockScene.input.once).not.toHaveBeenCalled();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
