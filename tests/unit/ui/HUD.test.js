import { describe, it, expect, beforeEach, vi } from 'vitest';
import HUD from '../../../src/ui/HUD.js';

describe('HUD', () => {
  let mockScene;
  let mockScoreText;
  let mockLivesText;
  let mockLevelText;
  let mockGameOverText;

  beforeEach(() => {
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

  it('should create score, lives, and level text on construction', () => {
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

    expect(mockScene.add.text).toHaveBeenCalledWith(10, 70, 'Level: 1', {
      fontSize: '24pt',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fill: '#ffffff'
    });
  });

  it('should update score, lives, and level text when render is called', () => {
    const hud = new HUD(mockScene);
    hud.render(150, 2, 4);

    expect(mockScoreText.setText).toHaveBeenCalledWith('Score: 150');
    expect(mockLivesText.setText).toHaveBeenCalledWith('Lives: 2');
    expect(mockLevelText.setText).toHaveBeenCalledWith('Level: 4');
  });

  it('should display game over screen with final score', () => {
    const hud = new HUD(mockScene);
    
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

  it('should NOT register a pointerdown listener in showGameOver', () => {
    const hud = new HUD(mockScene);
    
    mockScene.input.once.mockClear();
    
    hud.showGameOver(250);

    expect(mockScene.input.once).not.toHaveBeenCalled();
  });

  it('should maintain score, lives, and level text references', () => {
    const hud = new HUD(mockScene);

    expect(hud.scoreText).toBe(mockScoreText);
    expect(hud.livesText).toBe(mockLivesText);
    expect(hud.levelText).toBe(mockLevelText);
  });
});
