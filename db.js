// Database utilities for Supabase integration

// Get Supabase credentials - USE YOUR ACTUAL CREDENTIALS FROM .env FILE
const SUPABASE_URL = 'https://xaiperlmtvanjuvvrvpl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhaXBlcmxtdHZhbmp1dnZydnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDg5MDEsImV4cCI6MjA3ODEyNDkwMX0.mKv3Exuex2-dQNwZowWRdQRrEkZmf4rI59ro8EYXqCw';

/**
 * Encodes category names for URL usage
 * @param {string} category - Category name that might contain special characters
 * @returns {string} URL-encoded category name
 */
function encodeCategory(category) {
    return encodeURIComponent(category);
}



/**
 * Saves a background photo to Supabase
 * @param {Object} photoData - Photo data object with url, title, description, etc.
 * @returns {Promise<Object>} The saved background photo data
 */
async function saveBackgroundPhoto(photoData) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/background_photos`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                url: photoData.url,
                title: photoData.title || 'Background Photo',
                description: photoData.description || '',
                created_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error saving background photo to Supabase:', error);
            throw new Error(`Supabase error: ${error.message || response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in saveBackgroundPhoto:', error);
        throw error;
    }
}

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
            url += `&category=eq.${encodeCategory(category)}`;
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
        
      
        return formattedPhotos;
    } catch (error) {
        console.error('❌ Error in loadPhotosFromSupabase:', error);
        // Return empty array on error to allow fallback
        return [];
    }
}

// ==================== ABOUT MEMBERS CRUD OPERATIONS ====================

/**
 * Saves a team member to Supabase about_members table
 * @param {Object} memberData - Member data object with name, role, image_url, etc.
 * @returns {Promise<Object>} The saved member data
 */
async function saveTeamMember(memberData) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/about_members`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                name: memberData.name,
                role: memberData.role,
                image_url: memberData.image_url,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error saving team member to Supabase:', error);
            throw new Error(`Supabase error: ${error.message || response.statusText}`);
        }

        const savedMember = await response.json();
        
        
        return Array.isArray(savedMember) ? savedMember[0] : savedMember;
    } catch (error) {
        console.error('❌ Error in saveTeamMember:', error);
        throw error;
    }
}

/**
 * Updates a team member in Supabase about_members table
 * @param {number} memberId - The ID of the team member
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<Object>} The updated member data
 */
async function updateTeamMember(memberId, updates) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/about_members?id=eq.${memberId}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                ...updates,
                updated_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error updating team member in Supabase:', error);
            throw new Error(`Supabase error: ${error.message || response.statusText}`);
        }

        const updatedMember = await response.json();
       
        return Array.isArray(updatedMember) ? updatedMember[0] : updatedMember;
    } catch (error) {
        console.error('❌ Error in updateTeamMember:', error);
        throw error;
    }
}

/**
 * Deletes a team member from Supabase about_members table
 * @param {number} memberId - The ID of the team member
 * @returns {Promise<void>}
 */
async function deleteTeamMember(memberId) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/about_members?id=eq.${memberId}`, {
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
            console.error('Error deleting team member from Supabase:', error);
            throw new Error(`Supabase error: ${error.message || response.statusText}`);
        }

        
    } catch (error) {
        console.error('❌ Error in deleteTeamMember:', error);
        throw error;
    }
}

/**
 * Loads all team members from Supabase about_members table
 * @returns {Promise<Array>} Array of team member objects
 */
async function loadTeamMembers() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/about_members?order=created_at.asc`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error loading team members from Supabase:', error);
            throw new Error(`Supabase error: ${error.message || response.statusText}`);
        }

        const members = await response.json();
        
        return members;
    } catch (error) {
        console.error('❌ Error in loadTeamMembers:', error);
        // Return empty array on error to allow fallback
        return [];
    }
}

// ==================== ABOUT INFO CRUD OPERATIONS ====================

/**
 * Saves or updates the main about information
 * @param {Object} aboutData - About data object with name, portrait_url, about_text, etc.
 * @returns {Promise<Object>} The saved about data
 */
async function saveAboutInfo(aboutData) {
    try {
        console.log('🔍 Saving about info:', aboutData);
        
        // First check if about info already exists
        const existing = await loadAboutInfo();
        console.log('🔍 Existing about info:', existing);
        
        if (existing) {
            console.log('📝 Updating existing record with ID:', existing.id);
            // Update existing record
            const response = await fetch(`${SUPABASE_URL}/rest/v1/about_info?id=eq.${existing.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    name: aboutData.name,
                    portrait_url: aboutData.portrait_url,
                    about_text: aboutData.about_text,
                    updated_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Error updating about info in Supabase:', error);
                throw new Error(`Supabase error: ${error.message || response.statusText}`);
            }

            const updatedAbout = await response.json();
            return Array.isArray(updatedAbout) ? updatedAbout[0] : updatedAbout;
        } else {
            // Create new record
            const response = await fetch(`${SUPABASE_URL}/rest/v1/about_info`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    name: aboutData.name,
                    portrait_url: aboutData.portrait_url,
                    about_text: aboutData.about_text,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Error saving about info to Supabase:', error);
                throw new Error(`Supabase error: ${error.message || response.statusText}`);
            }

            const savedAbout = await response.json();
           
            return Array.isArray(savedAbout) ? savedAbout[0] : savedAbout;
        }
    } catch (error) {
        console.error('❌ Error in saveAboutInfo:', error);
        throw error;
    }
}

/**
 * Loads the main about information from Supabase
 * @returns {Promise<Object|null>} About info object or null if not found
 */
async function loadAboutInfo() {
    try {
        console.log('🔍 Loading about info from Supabase...');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/about_info?limit=1`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error loading about info from Supabase:', error);
            throw new Error(`Supabase error: ${error.message || response.statusText}`);
        }

        const aboutInfo = await response.json();
       
        
        const result = aboutInfo.length > 0 ? aboutInfo[0] : null;
      
        
        
        return result;
    } catch (error) {
        console.error('❌ Error in loadAboutInfo:', error);
        return null;
    }
}

// Export the functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        saveImage, 
        savePhotoToSupabase, 
        updatePhotoInSupabase, 
        deletePhotoFromSupabase, 
        loadPhotosFromSupabase,
        saveBackgroundPhoto,
        saveTeamMember,
        updateTeamMember,
        deleteTeamMember,
        loadTeamMembers,
        saveAboutInfo,
        loadAboutInfo
    };
}
// For browser environment
if (typeof window !== 'undefined') {
    window.db = { 
        saveImage, 
        savePhotoToSupabase, 
        updatePhotoInSupabase, 
        deletePhotoFromSupabase, 
        loadPhotosFromSupabase,
        saveBackgroundPhoto,
        saveTeamMember,
        updateTeamMember,
        deleteTeamMember,
        loadTeamMembers,
        saveAboutInfo,
        loadAboutInfo
    };
}
