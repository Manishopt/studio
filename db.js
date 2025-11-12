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

// Export the function for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { saveImage };
}
// For browser environment
if (typeof window !== 'undefined') {
    window.db = { saveImage };
}
