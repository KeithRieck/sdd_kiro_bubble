import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('Main Integration', () => {
  let originalPhaser;

  beforeEach(() => {
    // Save original Phaser if it exists
    originalPhaser = global.Phaser;
    
    // Clear module cache to allow fresh imports
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original Phaser
    if (originalPhaser) {
      global.Phaser = originalPhaser;
    } else {
      delete global.Phaser;
    }
  });

  it('should export Phaser game configuration with correct scenes', async () => {
    // Mock Phaser globally before importing main
    global.Phaser = {
      AUTO: 'AUTO',
      Game: vi.fn(function(config) {
        this.config = config;
      }),
      Scene: class Scene {
        constructor(config) {
          this.sys = { settings: config || {} };
        }
      }
    };

    // Dynamically import main.js after Phaser is mocked
    await import('../../../src/main.js');
    
    // Verify Phaser.Game was called
    expect(global.Phaser.Game).toHaveBeenCalled();
    
    // Get the config passed to Phaser.Game
    const gameConfig = global.Phaser.Game.mock.calls[0][0];
    
    // Verify game configuration
    expect(gameConfig.type).toBe('AUTO');
    expect(gameConfig.width).toBe(800);
    expect(gameConfig.height).toBe(600);
    expect(gameConfig.backgroundColor).toBe('#000000');
    
    // Verify scenes are configured
    expect(gameConfig.scene).toBeDefined();
    expect(gameConfig.scene.length).toBe(3);
    
    // Verify physics configuration
    expect(gameConfig.physics).toBeDefined();
    expect(gameConfig.physics.default).toBe('arcade');
  });

  it('should include BootScene, PreloaderScene, and GameScene in correct order', async () => {
    // Mock Phaser globally
    global.Phaser = {
      AUTO: 'AUTO',
      Game: vi.fn(function(config) {
        this.config = config;
      }),
      Scene: class Scene {
        constructor(config) {
          this.sys = { settings: config || {} };
        }
      }
    };

    // Import main.js
    await import('../../../src/main.js');
    
    // Verify Phaser.Game was called
    expect(global.Phaser.Game).toHaveBeenCalled();
    
    // Get the config
    const gameConfig = global.Phaser.Game.mock.calls[0][0];
    
    // Verify scene order by checking scene class names
    const scenes = gameConfig.scene;
    expect(scenes[0].name).toBe('BootScene');
    expect(scenes[1].name).toBe('PreloaderScene');
    expect(scenes[2].name).toBe('GameScene');
  });
});
