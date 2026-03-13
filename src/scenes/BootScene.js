/**
 * BootScene - Initial boot scene that loads the logo
 * This is the first scene that runs when the game starts
 */
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  /**
   * Preload the logo image for use in PreloaderScene
   */
  preload() {
    // Load the logo that will be displayed in PreloaderScene
    this.load.image('logo', 'assets/images/logo.png');
  }

  /**
   * Start the preloader scene after logo is loaded
   */
  create() {
    // Start the preloader scene
    this.scene.start('PreloaderScene');
  }
}

export default BootScene;
