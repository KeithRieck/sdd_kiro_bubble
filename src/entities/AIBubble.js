import Bubble from './Bubble.js';

/**
 * AI-controlled bubble entity that moves autonomously and bounces off boundaries.
 * Extends the Bubble base class with velocity-based movement and pastel coloring.
 */
class AIBubble extends Bubble {
  /**
   * Create an AI bubble
   * @param {Phaser.Scene} scene - The Phaser scene this bubble belongs to
   * @param {number} x - Initial x position in pixels
   * @param {number} y - Initial y position in pixels
   * @param {number} size - Diameter of the bubble in pixels
   * @param {number} velocityX - Horizontal velocity in pixels per second
   * @param {number} velocityY - Vertical velocity in pixels per second
   */
  constructor(scene, x, y, size, velocityX, velocityY) {
    super(scene, x, y, size);
    this.velocityX = velocityX;  // pixels per second
    this.velocityY = velocityY;  // pixels per second
    this.color = this.generatePastelColor();
  }

  /**
   * Generate a random pastel color using HSL color space
   * Pastel colors have:
   * - Hue: 0-360 (full spectrum)
   * - Saturation: 25-50% (soft, not too vibrant)
   * - Lightness: 70-85% (bright, not too dark)
   * @returns {number} Hex color value
   */
  generatePastelColor() {
    const hue = Math.random() * 360;
    const saturation = 25 + Math.random() * 25;  // 25-50%
    const lightness = 70 + Math.random() * 15;   // 70-85%
    return this.hslToHex(hue, saturation, lightness);
  }

  /**
   * Convert HSL color values to hexadecimal color
   * @param {number} h - Hue (0-360 degrees)
   * @param {number} s - Saturation (0-100 percent)
   * @param {number} l - Lightness (0-100 percent)
   * @returns {number} Hex color value (e.g., 0xFF5733)
   */
  hslToHex(h, s, l) {
    // Normalize saturation and lightness to 0-1 range
    s /= 100;
    l /= 100;
    
    // Calculate chroma (color intensity)
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    // Determine RGB values based on hue sector
    if (h < 60) {
      r = c; g = x; b = 0;
    } else if (h < 120) {
      r = x; g = c; b = 0;
    } else if (h < 180) {
      r = 0; g = c; b = x;
    } else if (h < 240) {
      r = 0; g = x; b = c;
    } else if (h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    // Convert to 0-255 range and format as hex
    const toHex = (val) => {
      const hex = Math.round((val + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return parseInt(`0x${toHex(r)}${toHex(g)}${toHex(b)}`);
  }

  /**
   * Update bubble position and handle boundary bouncing
   * @param {number} delta - Time since last frame in milliseconds
   */
  update(delta) {
    // Convert delta from milliseconds to seconds
    const dt = delta / 1000;
    
    // Update position based on velocity
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;

    // Bounce off boundaries by reversing velocity
    const radius = this.getRadius();
    if (this.x - radius < 0 || this.x + radius > 800) {
      this.velocityX *= -1;
    }
    if (this.y - radius < 0 || this.y + radius > 600) {
      this.velocityY *= -1;
    }
    
    // Constrain position after checking both boundaries
    this.constrainToBounds(800, 600);
  }

  /**
   * Render the bubble as a colored circle with no border
   */
  render() {
    // Create graphics object if it doesn't exist
    if (!this.graphics) {
      this.graphics = this.scene.add.graphics();
    }
    
    // Clear previous frame and draw new circle
    this.graphics.clear();
    this.graphics.fillStyle(this.color, 1);
    this.graphics.fillCircle(this.x, this.y, this.getRadius());
  }
}

export default AIBubble;
