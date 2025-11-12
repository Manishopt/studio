// Cloudinary Configuration
const CONFIG = {
    CLOUD_NAME: 'dnpfsfvfv',
    UPLOAD_PRESET: 'unsigned_upload',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
};

// DOM Elements
const fileInput = document.getElementById('file-input');
const previewContainer = document.getElementById('preview-container');
const uploadButton = document.getElementById('upload-button');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressContainer = document.querySelector('.progress');
const gallery = document.getElementById('gallery');
const dropZone = document.getElementById('dropZone');

// Initialize
function init() {
    fileInput.addEventListener('change', handleFileSelect);
    uploadButton.addEventListener('click', handleUpload);
    
    // Drag and drop functionality
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#4CAF50';
        dropZone.style.background = '#f0f9f0';
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        dropZone.style.background = 'transparent';
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        dropZone.style.background = 'transparent';
        
        const files = e.dataTransfer.files;
        fileInput.files = files;
        handleFileSelect({ target: { files } });
    });
    
    loadGalleryFromLocalStorage();
}

// Handle file selection
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    previewContainer.innerHTML = '';
    
    if (files.length === 0) {
        uploadButton.style.display = 'none';
        return;
    }
    
    files.forEach((file, index) => {
        if (!isValidFile(file)) {
            alert(`Skipping ${file.name}: Invalid file type or size (Max 5MB)`);
            return;
        }
        
        const preview = createPreviewElement(file, index);
        previewContainer.appendChild(preview);
    });
    
    const validFiles = previewContainer.querySelectorAll('.preview-item').length;
    uploadButton.style.display = validFiles > 0 ? 'block' : 'none';
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
    const files = Array.from(fileInput.files).filter((_, i) => 
        document.querySelector(`.preview-item[data-index="${i}"]`)
    );
    
    if (files.length === 0) {
        alert('No valid files to upload');
        return;
    }
    
    uploadButton.disabled = true;
    progressContainer.style.display = 'block';
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
        uploadButton.disabled = false;
        fileInput.value = '';
        previewContainer.innerHTML = '';
        uploadButton.style.display = 'none';
        progressContainer.style.display = 'none';
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
    progressText.textContent = message;
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute('aria-valuenow', percent);
}

// Remove preview
function removePreview(index) {
    const preview = document.querySelector(`.preview-item[data-index="${index}"]`);
    if (preview) preview.remove();
    
    if (previewContainer.children.length === 0) {
        uploadButton.style.display = 'none';
    }
}

// Add to gallery
function addToGallery(result) {
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
    
    gallery.insertBefore(galleryItem, gallery.firstChild);
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
    const uploads = JSON.parse(localStorage.getItem('cloudinaryUploads') || '[]');
    uploads.forEach(result => addToGallery(result));
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
