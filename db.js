// Database utilities for Supabase integration

// Get Supabase credentials - USE YOUR ACTUAL CREDENTIALS FROM .env FILE
const SUPABASE_URL = 'https://xaiperlmtvanjuvvrvpl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhaXBlcmxtdHZhbmp1dnZydnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDg5MDEsImV4cCI6MjA3ODEyNDkwMX0.mKv3Exuex2-dQNwZowWRdQRrEkZmf4rI59ro8EYXqCw';

/**
 * Saves an image URL to the Supabase database
 * @param {string} url - The Cloudinary secure URL of the uploaded image
 * @returns {Promise<Object>} The response from Supabase
 */
async function saveImage(url) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/gallery`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal' // Don't return the inserted record
            },
            body: JSON.stringify({ 
                image_url: url,
                created_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error saving to Supabase:', error);
            throw new Error(`Supabase error: ${error.message || response.statusText}`);
        }

        console.log('Successfully saved to Supabase:', url);
        return response;
    } catch (error) {
        console.error('Error in saveImage:', error);
        throw error; // Re-throw to allow handling in the calling function
    }
}

/**
 * Saves a photo with full metadata to Supabase portfolio table
 * @param {Object} photoData - Photo data object with url, public_id, category, title, description, isMain, etc.
 * @returns {Promise<Object>} The saved photo data
 */
async function savePhotoToSupabase(photoData) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/portfolio`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation' // Return the inserted record
            },
            body: JSON.stringify({
                url: photoData.url,
                public_id: photoData.public_id,
                category: photoData.category,
                title: photoData.title || photoData.category + ' Photo',
                description: photoData.description || '',
                is_main: photoData.isMain || false,
                uploaded_at: photoData.uploaded_at || new Date().toISOString(),
                format: photoData.format || null,
                width: photoData.width || null,
                height: photoData.height || null
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error saving photo to Supabase:', error);
            throw new Error(`Supabase error: ${error.message || response.statusText}`);
        }

        const savedPhoto = await response.json();
        console.log('✅ Successfully saved photo to Supabase:', savedPhoto);
        return Array.isArray(savedPhoto) ? savedPhoto[0] : savedPhoto;
    } catch (error) {
        console.error('❌ Error in savePhotoToSupabase:', error);
        throw error;
    }
}

/**
 * Updates a photo in Supabase portfolio table
 * @param {string} publicId - The Cloudinary public_id of the photo
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<Object>} The updated photo data
 */
async function updatePhotoInSupabase(publicId, updates) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/portfolio?public_id=eq.${publicId}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                ...updates,
                is_main: updates.isMain !== undefined ? updates.isMain : updates.is_main
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error updating photo in Supabase:', error);
            throw new Error(`Supabase error: ${error.message || response.statusText}`);
        }

        const updatedPhoto = await response.json();
        console.log('✅ Successfully updated photo in Supabase:', updatedPhoto);
        return Array.isArray(updatedPhoto) ? updatedPhoto[0] : updatedPhoto;
    } catch (error) {
        console.error('❌ Error in updatePhotoInSupabase:', error);
        throw error;
    }
}

/**
 * Deletes a photo from Supabase portfolio table
 * @param {string} publicId - The Cloudinary public_id of the photo
 * @returns {Promise<void>}
 */
async function deletePhotoFromSupabase(publicId) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/portfolio?public_id=eq.${publicId}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error deleting photo from Supabase:', error);
            throw new Error(`Supabase error: ${error.message || response.statusText}`);
        }

        console.log('✅ Successfully deleted photo from Supabase:', publicId);
    } catch (error) {
        console.error('❌ Error in deletePhotoFromSupabase:', error);
        throw error;
    }
}

/**
 * Loads all photos from Supabase portfolio table
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} Array of photo objects
 */
async function loadPhotosFromSupabase(category = null) {
    try {
        let url = `${SUPABASE_URL}/rest/v1/portfolio?order=uploaded_at.desc`;
        if (category) {
            url += `&category=eq.${category}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error loading photos from Supabase:', error);
            throw new Error(`Supabase error: ${error.message || response.statusText}`);
        }

        const photos = await response.json();
        // Convert is_main to isMain for consistency
        const formattedPhotos = photos.map(photo => ({
            ...photo,
            isMain: photo.is_main || false,
            uploaded_at: photo.uploaded_at
        }));
        
        console.log(`✅ Successfully loaded ${formattedPhotos.length} photos from Supabase`);
        return formattedPhotos;
    } catch (error) {
        console.error('❌ Error in loadPhotosFromSupabase:', error);
        // Return empty array on error to allow fallback
        return [];
    }
}

// Export the functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        saveImage, 
        savePhotoToSupabase, 
        updatePhotoInSupabase, 
        deletePhotoFromSupabase, 
        loadPhotosFromSupabase 
    };
}
// For browser environment
if (typeof window !== 'undefined') {
    window.db = { 
        saveImage, 
        savePhotoToSupabase, 
        updatePhotoInSupabase, 
        deletePhotoFromSupabase, 
        loadPhotosFromSupabase 
    };
}
