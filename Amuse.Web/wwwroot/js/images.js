/**
 * Images Module - Handles image upload, preview, and display utilities
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Initialize image handling for all forms
 */
export function initImageHandlers() {
    console.log('🖼️ Initializing image handlers...');
    
    // Img2Img image upload
    initImageUpload('i2i', 'i2i-image', 'i2i-drop-zone', 'i2i-preview', 'i2i-preview-container', 'i2i-image-base64', 'i2i-image-info', 'i2i-clear-image');
    
    // Upscale image upload
    initImageUpload('upscale', 'upscale-image', 'upscale-drop-zone', 'upscale-preview', 'upscale-preview-container', 'upscale-image-base64', 'upscale-image-info', 'upscale-clear-image', true);
    
    console.log('✅ Image handlers initialized');
}

/**
 * Initialize image upload for a specific form
 */
function initImageUpload(formPrefix, inputId, dropZoneId, previewId, previewContainerId, base64Id, infoId, clearBtnId, updateDimensions = false) {
    const input = document.getElementById(inputId);
    const dropZone = document.getElementById(dropZoneId);
    const preview = document.getElementById(previewId);
    const previewContainer = document.getElementById(previewContainerId);
    const base64Input = document.getElementById(base64Id);
    const info = document.getElementById(infoId);
    const clearBtn = document.getElementById(clearBtnId);
    
    if (!input || !dropZone) return;
    
    // Handle file selection
    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await handleImageFile(file, preview, previewContainer, base64Input, info, updateDimensions);
        }
    });
    
    // Handle drag and drop
    setupDragDrop(dropZone, input, async (file) => {
        await handleImageFile(file, preview, previewContainer, base64Input, info, updateDimensions);
    });
    
    // Handle clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearImagePreview(input, preview, previewContainer, base64Input, info, updateDimensions);
        });
    }
}

/**
 * Setup drag and drop for a drop zone
 */
function setupDragDrop(dropZone, fileInput, callback) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    // Highlight drop zone on drag enter/over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drop-zone-active');
        }, false);
    });
    
    // Remove highlight on drag leave/drop
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drop-zone-active');
        }, false);
    });
    
    // Handle drop
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            // Update file input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            callback(file);
        }
    }, false);
    
    // Handle click on drop zone (except on buttons)
    dropZone.addEventListener('click', (e) => {
        if (e.target !== fileInput && !e.target.closest('button')) {
            fileInput.click();
        }
    });
}

/**
 * Handle image file selection
 */
async function handleImageFile(file, previewImg, previewContainer, base64Input, infoElement, updateDimensions = false) {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
        alert(validation.error);
        return;
    }
    
    try {
        // Convert to base64
        const base64 = await fileToBase64(file);
        
        // Update hidden input
        if (base64Input) {
            base64Input.value = base64;
        }
        
        // Show preview
        if (previewImg && previewContainer) {
            previewImg.src = `data:${file.type};base64,${base64}`;
            previewImg.onload = () => {
                if (infoElement) {
                    infoElement.innerHTML = `
                        <span class="info-filename">${file.name}</span>
                        <span class="info-dimensions">${previewImg.naturalWidth} x ${previewImg.naturalHeight}px</span>
                        <span class="info-size">${formatBytes(file.size)}</span>
                    `;
                }
                
                if (updateDimensions && typeof window.updateUpscaleDimensions === 'function') {
                    window.updateUpscaleDimensions();
                }
            };
            
            // Show preview, hide drop content
            const dropContent = previewContainer.parentElement.querySelector('.drop-zone-content');
            if (dropContent) dropContent.classList.add('hidden');
            previewContainer.classList.remove('hidden');
        }
        
        console.log(`✅ Image loaded: ${file.name} (${formatBytes(file.size)})`);
    } catch (error) {
        console.error('❌ Failed to load image:', error);
        alert('Failed to load image. Please try again.');
    }
}

/**
 * Clear image preview
 */
function clearImagePreview(fileInput, previewImg, previewContainer, base64Input, infoElement, updateDimensions = false) {
    // Clear file input
    if (fileInput) fileInput.value = '';
    
    // Clear base64
    if (base64Input) base64Input.value = '';
    
    // Clear preview
    if (previewImg) previewImg.src = '';
    
    // Hide preview, show drop content
    if (previewContainer) {
        previewContainer.classList.add('hidden');
        const dropContent = previewContainer.parentElement.querySelector('.drop-zone-content');
        if (dropContent) dropContent.classList.remove('hidden');
    }
    
    // Clear info
    if (infoElement) infoElement.innerHTML = '';
    
    // Update dimensions
    if (updateDimensions && typeof window.updateUpscaleDimensions === 'function') {
        window.updateUpscaleDimensions();
    }
}

/**
 * Convert file to base64 string
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove data URL prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Convert base64 to file
 * @param {string} base64
 * @param {string} filename
 * @param {string} mimeType
 * @returns {File}
 */
export function base64ToFile(base64, filename, mimeType = 'image/png') {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
}

/**
 * Validate image file
 * @param {File} file
 * @returns {{valid: boolean, error?: string}}
 */
export function validateImageFile(file) {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type: ${file.type}. Please use JPEG, PNG, or WEBP.`
        };
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large: ${formatBytes(file.size)}. Maximum size is ${formatBytes(MAX_FILE_SIZE)}.`
        };
    }
    
    return { valid: true };
}

/**
 * Display generated image in container
 * @param {string} containerId
 * @param {string} base64Data
 * @param {string} mimeType
 */
export function displayGeneratedImage(containerId, base64Data, mimeType = 'image/png') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <img src="data:${mimeType};base64,${base64Data}" 
             alt="Generated image" 
             class="generated-image"
             onclick="downloadImage(this.src, 'generated-image.png')"
             title="Click to download">
        <div class="image-actions">
            <button class="btn btn-secondary btn-small" onclick="downloadImage('data:${mimeType};base64,${base64Data}', 'generated-image.png')">
                Download
            </button>
        </div>
    `;
}

/**
 * Clear image preview by ID
 * @param {string} previewId
 */
export function clearImagePreviewById(previewId) {
    const preview = document.getElementById(previewId);
    if (preview) {
        preview.src = '';
        preview.parentElement.classList.add('hidden');
    }
}

/**
 * Get image dimensions from base64
 * @param {string} base64
 * @returns {Promise<{width: number, height: number}>}
 */
export function getImageDimensions(base64) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = reject;
        img.src = `data:image/png;base64,${base64}`;
    });
}

/**
 * Resize image if needed
 * @param {string} base64
 * @param {number} maxDimension
 * @returns {Promise<string>}
 */
export function resizeImageIfNeeded(base64, maxDimension = 1024) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            if (img.naturalWidth <= maxDimension && img.naturalHeight <= maxDimension) {
                resolve(base64);
                return;
            }
            
            // Calculate new dimensions
            let width = img.naturalWidth;
            let height = img.naturalHeight;
            
            if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
            } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
            }
            
            // Create canvas and resize
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get resized base64
            const resizedBase64 = canvas.toDataURL('image/png').split(',')[1];
            resolve(resizedBase64);
        };
        img.onerror = reject;
        img.src = `data:image/png;base64,${base64}`;
    });
}

/**
 * Estimate file size from base64
 * @param {string} base64
 * @returns {number} Size in bytes
 */
export function estimateFileSize(base64) {
    // Base64 is ~4/3 of binary size
    return Math.ceil(base64.length * 0.75);
}

/**
 * Format bytes to human readable string
 * @param {number} bytes
 * @param {number} decimals
 * @returns {string}
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * @param {string} filename
 * @returns {string}
 */
export function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Download image
 * @param {string} dataUrl
 * @param {string} filename
 */
export function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Make downloadImage available globally for onclick handlers
window.downloadImage = downloadImage;
