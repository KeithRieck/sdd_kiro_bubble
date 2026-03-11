/**
 * HUD (Heads-Up Display) class
 * Manages the score and lives display, and game over screen
 */
class HUD {
  constructor(scene) {
    this.scene = scene;
    this.scoreText = null;
    this.livesText = null;
    this.gameOverText = null;
    this.createUI();
  }

  /**
   * Create the UI elements (score and lives text)
   */
  createUI() {
    this.scoreText = this.scene.add.text(10, 10, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.livesText = this.scene.add.text(10, 40, 'Lives: 3', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  /**
   * Update the HUD display with current score and lives
   * @param {number} score - Current score
   * @param {number} lives - Current lives
   */
  render(score, lives) {
    this.scoreText.setText(`Score: ${score}`);
    this.livesText.setText(`Lives: ${lives}`);
  }

  /**
   * Display game over screen with final score and restart option
   * @param {number} finalScore - Final score to display
   */
  showGameOver(finalScore) {
    this.gameOverText = this.scene.add.text(
      400,
      300,
      `Game Over\nFinal Score: ${finalScore}\nClick to Restart`,
      {
        fontSize: '32px',
        fill: '#ffffff',
        align: 'center'
      }
    );
    this.gameOverText.setOrigin(0.5);

    this.scene.input.once('pointerdown', () => {
      this.scene.scene.restart();
    });
  }
}

export default HUD;
