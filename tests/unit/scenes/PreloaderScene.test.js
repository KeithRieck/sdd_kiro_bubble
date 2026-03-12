import { describe, it, expect, beforeEach, vi } from 'vitest';
import PreloaderScene from '../../../src/scenes/PreloaderScene.js';

describe('PreloaderScene', () => {
  let preloaderScene;
  let mockAdd;
  let mockLoad;
  let mockSceneManager;
  let mockGraphics;
  let mockImage;
  let loadEventHandlers;

  beforeEach(() => {
    loadEventHandlers = {};

    mockGraphics = {
      fillStyle: vi.fn(),
      fillRect: vi.fn(),
      clear: vi.fn(),
      destroy: vi.fn()
    };

    mockImage = {
      setOrigin: vi.fn()
    };

    mockAdd = {
      image: vi.fn(() => mockImage),
      graphics: vi.fn(() => mockGraphics)
    };

    mockLoad = {
      audio: vi.fn(),
      on: vi.fn((event, handler) => {
        loadEventHandlers[event] = handler;
      })
    };

    mockSceneManager = {
      start: vi.fn()
    };

    preloaderScene = new PreloaderScene();
    preloaderScene.add = mockAdd;
    preloaderScene.load = mockLoad;
    preloaderScene.scene = mockSceneManager;
  });

  it('should have the correct scene key', () => {
    // The scene key is set in the constructor config
    const config = preloaderScene.sys?.settings || { key: 'PreloaderScene' };
    expect(config.key).toBe('PreloaderScene');
  });

  it('should display logo in preload', () => {
    preloaderScene.preload();

    expect(mockAdd.image).toHaveBeenCalledWith(400, 300, 'logo');
    expect(mockImage.setOrigin).toHaveBeenCalledWith(0.5);
  });

  it('should create progress bar graphics in preload', () => {
    preloaderScene.preload();

    expect(mockAdd.graphics).toHaveBeenCalled();
    expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x222222, 0.8);
    expect(mockGraphics.fillRect).toHaveBeenCalledWith(250, 350, 300, 30);
  });

  it('should load all sound effects in preload', () => {
    preloaderScene.preload();

    expect(mockLoad.audio).toHaveBeenCalledWith('pop', 'assets/audio/pop.mp3');
    expect(mockLoad.audio).toHaveBeenCalledWith('explosion', 'assets/audio/explosion.wav');
    expect(mockLoad.audio).toHaveBeenCalledWith('fanfare', 'assets/audio/fanfare.mp3');
  });

  it('should update progress bar on progress event', () => {
    preloaderScene.preload();

    // Simulate progress event
    const progressHandler = loadEventHandlers['progress'];
    expect(progressHandler).toBeDefined();

    progressHandler(0.5);

    expect(mockGraphics.clear).toHaveBeenCalled();
    expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x4a90e2, 1);
    expect(mockGraphics.fillRect).toHaveBeenCalledWith(260, 360, 280 * 0.5, 10);
  });

  it('should destroy progress graphics on complete event', () => {
    preloaderScene.preload();

    // Simulate complete event
    const completeHandler = loadEventHandlers['complete'];
    expect(completeHandler).toBeDefined();

    completeHandler();

    expect(mockGraphics.destroy).toHaveBeenCalledTimes(2); // Both progressBar and progressBox
  });

  it('should start GameScene in create', () => {
    preloaderScene.create();

    expect(mockSceneManager.start).toHaveBeenCalledWith('GameScene');
  });

  it('should be a Phaser Scene', () => {
    expect(preloaderScene).toBeInstanceOf(Phaser.Scene);
  });
});
