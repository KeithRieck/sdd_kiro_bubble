// Main entry point for Bubble Consumption Game
import BootScene from './scenes/BootScene.js';
import PreloaderScene from './scenes/PreloaderScene.js';
import GameScene from './scenes/GameScene.js';

// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [BootScene, PreloaderScene, GameScene]
};

// Create game instance
const game = new Phaser.Game(config);

console.log('Bubble Consumption Game initialized');
