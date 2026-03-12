/**
 * PreloaderScene - Asset loading scene with progress bar
 * Displays the logo and loads all game assets
 */
class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  /**
   * Load all game assets and display loading progress
   */
  preload() {
    // Display logo while loading
    const logo = this.add.image(400, 300, 'logo');
    logo.setOrigin(0.5);

    // Create loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(250, 350, 300, 30);

    // Update progress bar as assets load
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x4a90e2, 1);
      progressBar.fillRect(260, 360, 280 * value, 10);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    // Load sound effects
    this.load.audio('pop', 'assets/audio/pop.mp3');
    this.load.audio('explosion', 'assets/audio/explosion.wav');
    this.load.audio('fanfare', 'assets/audio/fanfare.mp3');
  }

  /**
   * Start the main game scene after all assets are loaded
   */
  create() {
    // Start the main game scene
    this.scene.start('GameScene');
  }
}

export default PreloaderScene;
