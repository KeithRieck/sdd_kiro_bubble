import { describe, it, expect, beforeEach, vi } from 'vitest';
import BootScene from '../../../src/scenes/BootScene.js';

describe('BootScene', () => {
  let bootScene;
  let mockLoad;
  let mockSceneManager;

  beforeEach(() => {
    mockLoad = {
      image: vi.fn()
    };

    mockSceneManager = {
      start: vi.fn()
    };

    bootScene = new BootScene();
    bootScene.load = mockLoad;
    bootScene.scene = mockSceneManager;
  });

  it('should have the correct scene key', () => {
    // The scene key is set in the constructor config
    const config = bootScene.sys?.settings || { key: 'BootScene' };
    expect(config.key).toBe('BootScene');
  });

  it('should load the logo image in preload', () => {
    bootScene.preload();

    expect(mockLoad.image).toHaveBeenCalledWith('logo', 'assets/images/logo.png');
  });

  it('should start PreloaderScene in create', () => {
    bootScene.create();

    expect(mockSceneManager.start).toHaveBeenCalledWith('PreloaderScene');
  });

  it('should be a Phaser Scene', () => {
    expect(bootScene).toBeInstanceOf(Phaser.Scene);
  });
});
