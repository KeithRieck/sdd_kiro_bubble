import { describe, it, expect, beforeEach, vi } from 'vitest';
import HUD from '../../../src/ui/HUD.js';

describe('HUD', () => {
  let mockScene;
  let mockScoreText;
  let mockLivesText;
  let mockGameOverText;

  beforeEach(() => {
    mockScoreText = {
      setText: vi.fn()
    };

    mockLivesText = {
      setText: vi.fn()
    };

    mockGameOverText = {
      setOrigin: vi.fn()
    };

    mockScene = {
      add: {
        text: vi.fn((x, y, text, style) => {
          // Check for exact matches first to avoid substring issues
          if (text === 'Score: 0') return mockScoreText;
          if (text === 'Lives: 3') return mockLivesText;
          // Game Over text contains "Score" but should return game over mock
          if (text.includes('Game Over')) return mockGameOverText;
          // Fallback for any other text
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

  it('should create score and lives text on construction', () => {
    const hud = new HUD(mockScene);

    expect(mockScene.add.text).toHaveBeenCalledWith(10, 10, 'Score: 0', {
      fontSize: '24pt',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fill: '#ffffff'
    });

    expect(mockScene.add.text).toHaveBeenCalledWith(10, 40, 'Lives: 3', {
      fontSize: '24pt',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fill: '#ffffff'
    });
  });

  it('should update score and lives text when render is called', () => {
    const hud = new HUD(mockScene);
    hud.render(150, 2);

    expect(mockScoreText.setText).toHaveBeenCalledWith('Score: 150');
    expect(mockLivesText.setText).toHaveBeenCalledWith('Lives: 2');
  });

  it('should display game over screen with final score', () => {
    const hud = new HUD(mockScene);
    
    // Reset the mock to track only showGameOver calls
    mockScene.add.text.mockClear();
    
    hud.showGameOver(250);

    expect(mockScene.add.text).toHaveBeenCalledWith(
      400,
      300,
      'Game Over\nFinal Score: 250\nClick to Restart',
      {
        fontSize: '32px',
        fill: '#ffffff',
        align: 'center'
      }
    );

    expect(mockGameOverText.setOrigin).toHaveBeenCalledWith(0.5);
  });

  it('should set up restart handler when showing game over', () => {
    const hud = new HUD(mockScene);
    
    // Reset the mock to track only showGameOver calls
    mockScene.add.text.mockClear();
    
    hud.showGameOver(250);

    expect(mockScene.input.once).toHaveBeenCalledWith('pointerdown', expect.any(Function));

    // Simulate click
    const clickHandler = mockScene.input.once.mock.calls[0][1];
    clickHandler();

    expect(mockScene.scene.restart).toHaveBeenCalled();
  });

  it('should maintain score and lives text references', () => {
    const hud = new HUD(mockScene);

    expect(hud.scoreText).toBe(mockScoreText);
    expect(hud.livesText).toBe(mockLivesText);
  });
});
