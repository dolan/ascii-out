/**
 * Main application class that coordinates the ASCII art conversion process
 */
class App {
    /**
     * Creates a new App instance and initializes the application
     */
    constructor() {
        this.imageProcessor = new ImageProcessor();
        this.asciiConverter = new AsciiConverter();
        this.fileHandler = new FileHandler();
        this.currentImage = null;
        this.initializeEventListeners();
    }

    /**
     * Initializes all event listeners for the application
     */
    initializeEventListeners() {
        // File input handling
        const imageInput = document.getElementById('image_input');
        imageInput.addEventListener('change', this.handleImageUpload.bind(this));

        // Drag and drop handling
        const dropZone = document.getElementById('preview_container');
        dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        dropZone.addEventListener('drop', this.handleDrop.bind(this));

        // Clipboard paste handling
        document.addEventListener('paste', this.handlePaste.bind(this));

        // Other event listeners
        document.getElementById('convert_button').addEventListener('click', this.handleConvert.bind(this));
        document.getElementById('download_button').addEventListener('click', this.handleDownload.bind(this));
    }

    /**
     * Handles drag over events
     * @param {DragEvent} event - The drag event
     */
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.add('drag-over');
    }

    /**
     * Handles drag leave events
     * @param {DragEvent} event - The drag event
     */
    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('drag-over');
    }

    /**
     * Handles drop events
     * @param {DragEvent} event - The drop event
     */
    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('drag-over');

        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processImageFile(file);
        }
    }

    /**
     * Handles paste events
     * @param {ClipboardEvent} event - The paste event
     */
    handlePaste(event) {
        const items = event.clipboardData.items;
        
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                this.processImageFile(file);
                break;
            }
        }
    }

    /**
     * Handles image upload events
     * @param {Event} event - The upload event
     */
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processImageFile(file);
        }
    }

    /**
     * Processes an image file and displays the preview
     * @param {File} file - The image file to process
     */
    async processImageFile(file) {
        try {
            // Create preview
            const previewUrl = URL.createObjectURL(file);
            const previewContainer = document.getElementById('preview_container');
            previewContainer.innerHTML = `<img src="${previewUrl}" alt="Preview">`;

            // Process image
            this.currentImage = await this.imageProcessor.loadImage(file);
            
            // Enable convert button
            document.getElementById('convert_button').disabled = false;
            
            // Clean up
            URL.revokeObjectURL(previewUrl);
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing image. Please try another image.');
        }
    }

    /**
     * Handles the conversion process
     */
    async handleConvert() {
        if (!this.currentImage) {
            alert('Please upload an image first');
            return;
        }

        try {
            // Get output format and style
            const format = document.getElementById('output_format').value;
            const style = document.getElementById('art_style').value;
            const strategy = document.getElementById('brightness_strategy').value;
            
            // Determine width based on format
            const width = format === 'text-wide' ? 320 : 160;
            
            // Convert to ASCII
            const asciiArt = this.asciiConverter.convertToAscii(this.currentImage, width, style, strategy);
            
            // Display ASCII art
            const outputElement = document.getElementById('ascii_output');
            outputElement.textContent = asciiArt;

            // Store the current result for download
            this.currentResult = {
                format: format,
                asciiArt: asciiArt
            };

            // Enable download button
            document.getElementById('download_button').disabled = false;
        } catch (error) {
            console.error('Error converting image:', error);
            alert('Error converting image to ASCII art');
        }
    }

    /**
     * Handles the download process
     */
    async handleDownload() {
        if (!this.currentResult) {
            alert('Please convert an image first');
            return;
        }

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            if (this.currentResult.format === 'text' || this.currentResult.format === 'text-wide') {
                // Download as text file
                this.fileHandler.downloadFile(
                    this.currentResult.asciiArt,
                    `ascii-art-${timestamp}.txt`
                );
            } else {
                // Download as PNG
                const pngBlob = await this.asciiConverter.renderAsPng(this.currentResult.asciiArt);
                if (!pngBlob || !(pngBlob instanceof Blob)) {
                    throw new Error('Invalid PNG blob generated');
                }
                this.fileHandler.downloadFile(
                    pngBlob,
                    `ascii-art-${timestamp}.png`,
                    'image/png'
                );
            }
        } catch (error) {
            console.error('Error downloading result:', error);
            alert('Error downloading the result: ' + error.message);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 