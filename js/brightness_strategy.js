/**
 * Abstract base class for brightness calculation strategies
 */
class BrightnessStrategy {
    /**
     * Calculate brightness value from RGB components
     * @param {number} r - Red component (0-255)
     * @param {number} g - Green component (0-255)
     * @param {number} b - Blue component (0-255)
     * @returns {number} Brightness value (0-1)
     */
    calculateBrightness(r, g, b) {
        throw new Error('BrightnessStrategy is abstract, must implement calculateBrightness');
    }
} 