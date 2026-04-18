/**
 * HUD (Heads-Up Display) class
 * Manages the score and lives display, and game over screen
 */
class HUD {
  constructor(scene) {
    this.scene = scene;
    this.scoreText = null;
    this.livesText = null;
    this.levelText = null;
    this.gameOverText = null;
    this.createUI();
  }

  /**
   * Create the UI elements (score, lives, and level text)
   * Uses 24pt Arial or Helvetica font as per Requirements 6.3
   */
  createUI() {
    this.scoreText = this.scene.add.text(10, 10, 'Score: 0', {
      fontSize: '24pt',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fill: '#ffffff'
    });

    this.livesText = this.scene.add.text(10, 40, 'Lives: 3', {
      fontSize: '24pt',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fill: '#ffffff'
    });

    this.levelText = this.scene.add.text(10, 70, 'Level: 1', {
      fontSize: '24pt',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fill: '#ffffff'
    });
  }

  /**
   * Update the HUD display with current score, lives, and level
   * @param {number} score - Current score
   * @param {number} lives - Current lives
   * @param {number} level - Current level
   */
  render(score, lives, level) {
    this.scoreText.setText(`Score: ${score}`);
    this.livesText.setText(`Lives: ${lives}`);
    this.levelText.setText(`Level: ${level}`);
  }

  /**
   * Display game over screen with final score
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
  }
}

export default HUD;
