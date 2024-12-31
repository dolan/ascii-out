/**
 * Converts image data to ASCII art
 */
class AsciiConverter {
    /**
     * Creates a new AsciiConverter instance
     */
    constructor() {
        // Define character sets for different styles
        this.charSets = {
            ascii: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
            blocks: '█▓▒░ ',
            minimal: '█ ',
            soft: '░▒▓█'  // Reversed order for low contrast effect
        };
        
        // Initialize brightness strategies
        this.brightnessStrategies = {
            perceived: new PerceivedBrightnessStrategy(),
            average: new AverageBrightnessStrategy(),
            lightness: new LightnessBrightnessStrategy(),
            luminosity: new LuminosityBrightnessStrategy()
        };
        
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
    }

    /**
     * Gets the brightness of a pixel (0-1)
     * @param {Uint8ClampedArray} data - The image data array
     * @param {number} index - The starting index of the pixel
     * @param {string} strategy - The brightness calculation strategy to use
     * @returns {number} The brightness value
     */
    getBrightness(data, index, strategy = 'perceived') {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        return this.brightnessStrategies[strategy].calculateBrightness(r, g, b);
    }

    /**
     * Adjusts contrast of a brightness value
     * @param {number} brightness - The input brightness value (0-1)
     * @param {string} style - The art style being used
     * @returns {number} The adjusted brightness value
     */
    adjustContrast(brightness, style) {
        if (style === 'minimal') {
            // High contrast threshold for minimal style
            return brightness > 0.5 ? 1 : 0;
        } else if (style === 'blocks') {
            // Slightly enhanced contrast for blocks
            return Math.pow(brightness, 0.8);
        } else if (style === 'soft') {
            // Compress the range to emphasize mid-tones
            return 0.3 + (brightness * 0.4);  // Maps 0-1 to 0.3-0.7
        }
        // Normal contrast for ASCII
        return brightness;
    }

    /**
     * Converts image data to ASCII art
     * @param {ImageData} imageData - The image data to convert
     * @param {number} width - The desired width in characters
     * @param {string} style - The art style to use
     * @param {string} strategy - The brightness calculation strategy to use
     * @returns {string} The ASCII art representation
     */
    convertToAscii(imageData, width, style = 'ascii', strategy = 'perceived') {
        const chars = this.charSets[style];
        const aspectRatio = imageData.height / imageData.width;
        const height = Math.floor(width * aspectRatio * 0.45);

        // Resize canvas to desired dimensions
        this.canvas.width = width;
        this.canvas.height = height;

        // Draw and scale the image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        const tempContext = tempCanvas.getContext('2d');
        tempContext.putImageData(imageData, 0, 0);

        // Clear and draw scaled image
        this.context.fillStyle = 'white';
        this.context.fillRect(0, 0, width, height);
        this.context.drawImage(tempCanvas, 0, 0, width, height);

        // Get scaled image data
        const scaledImageData = this.context.getImageData(0, 0, width, height);
        const pixels = scaledImageData.data;
        
        // Convert to ASCII
        let asciiArt = '';
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                let brightness = this.getBrightness(pixels, index, strategy);
                brightness = this.adjustContrast(brightness, style);
                const charIndex = Math.floor(brightness * (chars.length - 1));
                asciiArt += chars[charIndex];
            }
            asciiArt += '\n';
        }

        return asciiArt;
    }

    /**
     * Renders ASCII art as a PNG image
     * @param {string} asciiArt - The ASCII art to render
     * @returns {Promise<Blob>} A PNG blob of the rendered ASCII art
     */
    renderAsPng(asciiArt) {
        const lines = asciiArt.split('\n');
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const lineCount = lines.length;

        // Standard monospace character proportions (typically 1:2 width:height ratio)
        const charAspectRatio = 0.5; // width/height ratio of a typical monospace character
        
        // Base size calculations
        const baseSize = 12; // Base unit for scaling
        const charWidth = baseSize * charAspectRatio; // Make characters half as wide as they are tall
        const charHeight = baseSize;
        
        // Calculate image dimensions
        const imageWidth = maxLineLength * charWidth;
        const imageHeight = lineCount * charHeight;
        const padding = baseSize;

        // Set canvas dimensions
        this.canvas.width = imageWidth + (padding * 2);
        this.canvas.height = imageHeight + (padding * 2);

        // Setup canvas for text rendering
        this.context.fillStyle = 'white';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.font = `${charHeight}px monospace`;
        this.context.fillStyle = 'black';
        this.context.textBaseline = 'top';
        this.context.textAlign = 'left';

        // Render each line with proper character spacing
        lines.forEach((line, index) => {
            // Render each character individually to maintain proper spacing
            for (let i = 0; i < line.length; i++) {
                const x = padding + (i * charWidth);
                const y = padding + (index * charHeight);
                this.context.fillText(line[i], x, y);
            }
        });

        // Convert to PNG blob
        return new Promise((resolve, reject) => {
            try {
                this.canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create PNG blob'));
                    }
                }, 'image/png');
            } catch (error) {
                reject(error);
            }
        });
    }
} 