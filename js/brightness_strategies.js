/**
 * Perceived brightness using standard coefficients
 */
class PerceivedBrightnessStrategy extends BrightnessStrategy {
    calculateBrightness(r, g, b) {
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
}

/**
 * Average of RGB values
 */
class AverageBrightnessStrategy extends BrightnessStrategy {
    calculateBrightness(r, g, b) {
        return (r + g + b) / (3 * 255);
    }
}

/**
 * Lightness method (average of min and max RGB)
 */
class LightnessBrightnessStrategy extends BrightnessStrategy {
    calculateBrightness(r, g, b) {
        return (Math.max(r, g, b) + Math.min(r, g, b)) / (2 * 255);
    }
}

/**
 * Luminosity method (weighted for human perception)
 */
class LuminosityBrightnessStrategy extends BrightnessStrategy {
    calculateBrightness(r, g, b) {
        return (0.21 * r + 0.72 * g + 0.07 * b) / 255;
    }
} 