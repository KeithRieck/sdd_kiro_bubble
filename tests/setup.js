import { vi } from 'vitest';

// Mock Phaser globally
global.Phaser = {
  Scene: class Scene {
    constructor(config) {
      this.scene = { key: config?.key };
    }
  },
  Game: class Game {
    constructor(config) {
      this.config = config;
    }
  },
  AUTO: 'AUTO'
};
