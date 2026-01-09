// Cloudinary Configuration
const CONFIG = {
    CLOUD_NAME: 'dnpfsfvfv',
    UPLOAD_PRESET: 'unsigned_upload',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB - matching admin panel limit
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
};

// DOM Elements - wrapped in function to avoid conflicts
function getCloudinaryElements() {
    return {
        fileInput: document.getElementById('file-input'),
        previewContainer: document.getElementById('preview-container'),
        uploadButton: document.getElementById('upload-button'),
        progressBar: document.getElementById('progress-bar'),
        progressText: document.getElementById('progress-text'),
        progressContainer: document.querySelector('.progress'),
        gallery: document.getElementById('gallery'),
        dropZone: document.getElementById('dropZone')
    };
}

// Initialize
function init() {
    const elements = getCloudinaryElements();
    
    if (!elements.fileInput || !elements.uploadButton || !elements.dropZone) {
        return;
    }
    
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.uploadButton.addEventListener('click', handleUpload);
    
    // Drag and drop functionality
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.style.borderColor = '#4CAF50';
        elements.dropZone.style.background = '#f0f9f0';
    });
    
    elements.dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        elements.dropZone.style.borderColor = '#ccc';
        elements.dropZone.style.background = 'transparent';
    });
    
    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.style.borderColor = '#ccc';
        elements.dropZone.style.background = 'transparent';
        
        const files = e.dataTransfer.files;
        elements.fileInput.files = files;
        handleFileSelect({ target: { files } });
    });
    
    loadGalleryFromLocalStorage();
}

// Handle file selection
function handleFileSelect(event) {
    const elements = getCloudinaryElements();
    const files = Array.from(event.target.files);
    elements.previewContainer.innerHTML = '';
    
    if (files.length === 0) {
        elements.uploadButton.style.display = 'none';
        return;
    }
    
    files.forEach((file, index) => {
        if (!isValidFile(file)) {
            alert(`Skipping ${file.name}: Invalid file type or size (Max 5MB)`);
            return;
        }
        
        const preview = createPreviewElement(file, index);
        elements.previewContainer.appendChild(preview);
    });
    
    const validFiles = elements.previewContainer.querySelectorAll('.preview-item').length;
    elements.uploadButton.style.display = validFiles > 0 ? 'block' : 'none';
}

// Create preview element
function createPreviewElement(file, index) {
    const preview = document.createElement('div');
    preview.className = 'preview-item';
    preview.dataset.index = index;
    
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    
    const info = document.createElement('div');
    info.className = 'file-info';
    info.innerHTML = `
        <span class="file-name">${file.name}</span>
        <span class="file-size">${formatFileSize(file.size)}</span>
    `;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        removePreview(index);
    };
    
    preview.appendChild(img);
    preview.appendChild(info);
    preview.appendChild(removeBtn);
    
    return preview;
}

// Upload files to Cloudinary
async function handleUpload() {
    const elements = getCloudinaryElements();
    const files = Array.from(elements.fileInput.files).filter((_, i) => 
        document.querySelector(`.preview-item[data-index="${i}"]`)
    );
    
    if (files.length === 0) {
        alert('No valid files to upload');
        return;
    }
    
    elements.uploadButton.disabled = true;
    elements.progressContainer.style.display = 'block';
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const percent = ((i / files.length) * 100).toFixed(0);
        updateProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`, percent);
        
        try {
            const result = await uploadToCloudinary(file);
            if (result.success) {
                results.push(result);
                addToGallery(result);
                saveToLocalStorage(result);
            } else {
                alert(`Failed to upload ${file.name}: ${result.error}`);
            }
        } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            alert(`Error uploading ${file.name}: ${error.message}`);
        }
    }
    
    updateProgress(`Upload complete! ${results.length} file(s) uploaded successfully.`, 100);
    
    setTimeout(() => {
        elements.uploadButton.disabled = false;
        elements.fileInput.value = '';
        elements.previewContainer.innerHTML = '';
        elements.uploadButton.style.display = 'none';
        elements.progressContainer.style.display = 'none';
        updateProgress('Ready to upload', 0);
    }, 2000);
    
    return results;
}

// Upload single file to Cloudinary using FormData and save to Supabase
async function uploadToCloudinary(file) {
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CONFIG.CLOUD_NAME}/image/upload`;
    
    try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CONFIG.UPLOAD_PRESET);
        
        // Optional: Add additional parameters
        formData.append('folder', 'portfolio'); // Organize in folders
        
        // Upload to Cloudinary
        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }
        
        const data = await response.json();
        console.log('Cloudinary upload successful:', data.secure_url);
        
        // Save to Supabase if available
        if (typeof saveImage === 'function') {
            try {
                await saveImage(data.secure_url);
                console.log('Successfully saved to Supabase');
            } catch (error) {
                console.warn('Could not save to Supabase:', error.message);
                // Continue even if Supabase save fails
            }
        } else {
            console.warn('saveImage function not found. Make sure db.js is loaded.');
        }
        
        return {
            success: true,
            url: data.secure_url,
            public_id: data.public_id,
            format: data.format,
            width: data.width,
            height: data.height,
            created_at: data.created_at,
            original_filename: data.original_filename
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Validation helper
function isValidFile(file) {
    const isValidType = CONFIG.ALLOWED_TYPES.includes(file.type);
    const isValidSize = file.size <= CONFIG.MAX_FILE_SIZE;
    
    if (!isValidType) {
        console.log(`Invalid type: ${file.type}`);
    }
    if (!isValidSize) {
        console.log(`File too large: ${formatFileSize(file.size)}`);
    }
    
    return isValidType && isValidSize;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Update progress UI
function updateProgress(message, percent) {
    const elements = getCloudinaryElements();
    if (elements.progressText) {
        elements.progressText.textContent = message;
    }
    if (elements.progressBar) {
        elements.progressBar.style.width = `${percent}%`;
        elements.progressBar.setAttribute('aria-valuenow', percent);
    }
}

// Remove preview
function removePreview(index) {
    const elements = getCloudinaryElements();
    const preview = document.querySelector(`.preview-item[data-index="${index}"]`);
    if (preview) preview.remove();
    
    if (elements.previewContainer && elements.previewContainer.children.length === 0) {
        elements.uploadButton.style.display = 'none';
    }
}

// Add to gallery
function addToGallery(result) {
    const elements = getCloudinaryElements();
    if (!elements.gallery) return;
    
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    
    const img = document.createElement('img');
    img.src = result.url;
    img.alt = result.original_filename || 'Uploaded image';
    img.loading = 'lazy';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.onclick = () => deleteFromGallery(galleryItem, result.public_id);
    
    const info = document.createElement('div');
    info.className = 'gallery-info';
    info.innerHTML = `
        <span>${result.original_filename || 'Image'}</span>
        <span>${result.width} x ${result.height}</span>
    `;
    
    galleryItem.appendChild(img);
    galleryItem.appendChild(deleteBtn);
    galleryItem.appendChild(info);
    
    elements.gallery.insertBefore(galleryItem, elements.gallery.firstChild);
}

// Delete from gallery
function deleteFromGallery(element, publicId) {
    if (confirm('Are you sure you want to remove this image from the gallery?')) {
        element.remove();
        removeFromLocalStorage(publicId);
    }
}

// LocalStorage helpers
function saveToLocalStorage(result) {
    let uploads = JSON.parse(localStorage.getItem('cloudinaryUploads') || '[]');
    uploads.unshift(result);
    localStorage.setItem('cloudinaryUploads', JSON.stringify(uploads));
}

function removeFromLocalStorage(publicId) {
    let uploads = JSON.parse(localStorage.getItem('cloudinaryUploads') || '[]');
    uploads = uploads.filter(item => item.public_id !== publicId);
    localStorage.setItem('cloudinaryUploads', JSON.stringify(uploads));
}

function loadGalleryFromLocalStorage() {
    const elements = getCloudinaryElements();
    if (!elements.gallery) return;
    
    const uploads = JSON.parse(localStorage.getItem('cloudinaryUploads') || '[]');
    uploads.forEach(result => addToGallery(result));
}

// Upload image to Cloudinary - General purpose function
async function uploadImageToCloudinary(file, folder = 'general') {
    console.log('🚀 uploadImageToCloudinary called with:', file.name, folder);
    
    return new Promise((resolve, reject) => {
        // Validate file
        if (!file) {
            console.error('❌ No file provided');
            reject({ success: false, error: 'No file provided' });
            return;
        }

        // Check file type
        if (!CONFIG.ALLOWED_TYPES.includes(file.type)) {
            console.error('❌ Invalid file type:', file.type);
            reject({ success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' });
            return;
        }

        // Check file size
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            console.error('❌ File too large:', file.size);
            reject({ success: false, error: 'File size exceeds 10MB limit.' });
            return;
        }

        console.log('✅ File validation passed, starting upload...');

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CONFIG.UPLOAD_PRESET);
        formData.append('folder', folder);

        console.log('📤 FormData created:', {
            file: file.name,
            upload_preset: CONFIG.UPLOAD_PRESET,
            folder: folder
        });

        // Create XMLHttpRequest
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CONFIG.CLOUD_NAME}/image/upload`, true);
        console.log('🌐 Opening request to:', `https://api.cloudinary.com/v1_1/${CONFIG.CLOUD_NAME}/image/upload`);
        
        xhr.onload = function() {
            console.log('📡 Upload completed with status:', xhr.status);
            if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                console.log('✅ Upload successful:', result);
                resolve({ 
                    success: true, 
                    url: result.secure_url,
                    public_id: result.public_id,
                    original_filename: result.original_filename || file.name
                });
            } else {
                console.error('❌ Upload failed with status:', xhr.status, xhr.responseText);
                reject({ 
                    success: false, 
                    error: 'Upload failed: ' + xhr.statusText 
                });
            }
        };
        
        xhr.onerror = function() {
            console.error('❌ Network error during upload');
            reject({ 
                success: false, 
                error: 'Network error during upload' 
            });
        };
        
        xhr.send(formData);
        console.log('📤 Request sent, waiting for response...');
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
