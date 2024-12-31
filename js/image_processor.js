/**
 * Handles the processing and manipulation of uploaded images
 */
class ImageProcessor {
    /**
     * Creates a new ImageProcessor instance
     */
    constructor() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
    }

    /**
     * Loads an image file and returns its data
     * @param {File} file - The image file to process
     * @returns {Promise<ImageData>} The processed image data
     */
    async loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;
                    this.context.drawImage(img, 0, 0);
                    resolve(this.context.getImageData(0, 0, img.width, img.height));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
} 