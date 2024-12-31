/**
 * Handles file operations for the ASCII art converter
 */
class FileHandler {
    /**
     * Creates a new FileHandler instance
     */
    constructor() {
    }

    /**
     * Downloads content as a file
     * @param {Blob|string} content - The content to download
     * @param {string} filename - The name of the file to download
     * @param {string} [mimeType='text/plain'] - The MIME type of the content
     */
    downloadFile(content, filename, mimeType = 'text/plain') {
        try {
            const blob = content instanceof Blob ? 
                new Blob([content], { type: content.type || mimeType }) : 
                new Blob([content], { type: mimeType });
            
            if (!blob) {
                throw new Error('Failed to create blob');
            }

            const url = URL.createObjectURL(blob);
            if (!url) {
                throw new Error('Failed to create object URL');
            }

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            throw new Error(`Failed to download file: ${error.message}`);
        }
    }
} 