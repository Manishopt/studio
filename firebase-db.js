// Firebase Database Helper for Admin Panel Features
// This file handles all Firebase Firestore operations
// Note: firebaseConfig is already declared in admin-panel.html

// Initialize Firebase
let initialized = false;

function initializeFirebase() {
    if (initialized) return;
    
    try {
        // Use the global db and auth from admin-panel.html
        if (typeof db !== 'undefined' && typeof auth !== 'undefined') {
            initialized = true;
            console.log('✅ Firebase initialized successfully (using global db and auth)');
        } else {
            console.error('❌ Global db or auth not available');
            console.log('db available:', typeof db !== 'undefined');
            console.log('auth available:', typeof auth !== 'undefined');
        }
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
    }
}

// ==================== PORTFOLIO FUNCTIONS ====================

/**
 * Add a new portfolio item
 * @param {Object} portfolioData - { title, description, imageUrl, category }
 */
async function addPortfolioItem(portfolioData) {
    try {
        initializeFirebase();
        const docRef = await db.collection('portfolio').add({
            title: portfolioData.title,
            description: portfolioData.description || '',
            imageUrl: portfolioData.imageUrl,
            category: portfolioData.category || 'General',
            createdAt: new Date().toISOString()
        });
        console.log('✅ Portfolio item added with ID:', docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('❌ Error adding portfolio item:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all portfolio items
 */
async function getPortfolioItems() {
    try {
        initializeFirebase();
        const snapshot = await db.collection('portfolio')
            .orderBy('createdAt', 'desc')
            .get();
        
        const items = [];
        snapshot.forEach(doc => {
            items.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`✅ Retrieved ${items.length} portfolio items`);
        return { success: true, data: items };
    } catch (error) {
        console.error('❌ Error getting portfolio items:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a portfolio item
 * @param {string} itemId - Document ID
 */
async function deletePortfolioItem(itemId) {
    try {
        initializeFirebase();
        await db.collection('portfolio').doc(itemId).delete();
        console.log('✅ Portfolio item deleted:', itemId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting portfolio item:', error);
        return { success: false, error: error.message };
    }
}

// ==================== SERVICES FUNCTIONS ====================

/**
 * Add a new service
 * @param {Object} serviceData - { serviceName, description, icon }
 */
async function addService(serviceData) {
    try {
        initializeFirebase();
        const docRef = await db.collection('services').add({
            serviceName: serviceData.serviceName,
            description: serviceData.description || '',
            icon: serviceData.icon || 'fas fa-camera',
            createdAt: new Date().toISOString()
        });
        console.log('✅ Service added with ID:', docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('❌ Error adding service:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all services
 */
async function getServices() {
    try {
        initializeFirebase();
        const snapshot = await db.collection('services')
            .orderBy('createdAt', 'desc')
            .get();
        
        const services = [];
        snapshot.forEach(doc => {
            services.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`✅ Retrieved ${services.length} services`);
        return { success: true, data: services };
    } catch (error) {
        console.error('❌ Error getting services:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update a service
 * @param {string} serviceId - Document ID
 * @param {Object} updateData - Data to update
 */
async function updateService(serviceId, updateData) {
    try {
        initializeFirebase();
        await db.collection('services').doc(serviceId).update(updateData);
        console.log('✅ Service updated:', serviceId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error updating service:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a service
 * @param {string} serviceId - Document ID
 */
async function deleteService(serviceId) {
    try {
        initializeFirebase();
        await db.collection('services').doc(serviceId).delete();
        console.log('✅ Service deleted:', serviceId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting service:', error);
        return { success: false, error: error.message };
    }
}

// ==================== TESTIMONIALS FUNCTIONS ====================

/**
 * Add a new testimonial with image upload support
 * @param {Object} testimonialData - { clientName, testimonialText, rating, clientImage }
 */
async function addTestimonial(testimonialData) {
    try {
        initializeFirebase();
        
        // Debug authentication state
        const currentUser = auth.currentUser;
        console.log('🔍 Current user:', currentUser);
        console.log('🔍 User UID:', currentUser ? currentUser.uid : 'No user');
        console.log('🔍 User email:', currentUser ? currentUser.email : 'No user');
        
        const docRef = await db.collection('testimonials').add({
            clientName: testimonialData.clientName,
            testimonialText: testimonialData.testimonialText,
            rating: testimonialData.rating || 5,
            clientImage: testimonialData.clientImage || null,
            createdAt: new Date().toISOString()
        });
        console.log('✅ Testimonial added with ID:', docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('❌ Error adding testimonial:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get all testimonials
 */
async function getTestimonials() {
    try {
        initializeFirebase();
        const snapshot = await db.collection('testimonials')
            .orderBy('createdAt', 'desc')
            .get();
        
        const testimonials = [];
        snapshot.forEach(doc => {
            testimonials.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`✅ Retrieved ${testimonials.length} testimonials`);
        return { success: true, data: testimonials };
    } catch (error) {
        console.error('❌ Error getting testimonials:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a testimonial
 * @param {string} testimonialId - Document ID
 */
async function deleteTestimonial(testimonialId) {
    try {
        initializeFirebase();
        await db.collection('testimonials').doc(testimonialId).delete();
        console.log('✅ Testimonial deleted:', testimonialId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting testimonial:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update a testimonial
 * @param {string} testimonialId - Document ID
 * @param {Object} updateData - Data to update
 */
async function updateTestimonial(testimonialId, updateData) {
    try {
        initializeFirebase();
        await db.collection('testimonials').doc(testimonialId).update(updateData);
        console.log('✅ Testimonial updated:', testimonialId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error updating testimonial:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Upload image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} fileName - Custom file name
 * @returns {Promise<string>} Download URL
 */
async function uploadTestimonialImage(file, fileName) {
    try {
        initializeFirebase();
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`testimonials/${fileName}`);
        
        // Upload file
        const snapshot = await imageRef.put(file);
        
        // Get download URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        console.log('✅ Image uploaded to Firebase Storage:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('❌ Error uploading image to Firebase Storage:', error);
        throw error;
    }
}

// ==================== ABOUT INFO FUNCTIONS ====================

/**
 * Update about information
 * @param {Object} aboutData - { studioName, description, experience, email, phone }
 */
async function updateAboutInfo(aboutData) {
    try {
        initializeFirebase();
        await db.collection('settings').doc('about').set(aboutData, { merge: true });
        console.log('✅ About info updated');
        return { success: true };
    } catch (error) {
        console.error('❌ Error updating about info:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get about information
 */
async function getAboutInfo() {
    try {
        initializeFirebase();
        const doc = await db.collection('settings').doc('about').get();
        
        if (doc.exists) {
            console.log('✅ About info retrieved');
            return { success: true, data: doc.data() };
        } else {
            console.log('⚠️ No about info found');
            return { success: true, data: {} };
        }
    } catch (error) {
        console.error('❌ Error getting about info:', error);
        return { success: false, error: error.message };
    }
}

// ==================== CONTACT INFO FUNCTIONS ====================

/**
 * Update contact information
 * @param {Object} contactData - { email, phone, address, socialMedia }
 */
async function updateContactInfo(contactData) {
    try {
        initializeFirebase();
        await db.collection('settings').doc('contact').set(contactData, { merge: true });
        console.log('✅ Contact info updated');
        return { success: true };
    } catch (error) {
        console.error('❌ Error updating contact info:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get contact information
 */
async function getContactInfo() {
    try {
        initializeFirebase();
        const doc = await db.collection('settings').doc('contact').get();
        
        if (doc.exists) {
            console.log('✅ Contact info retrieved');
            return { success: true, data: doc.data() };
        } else {
            console.log('⚠️ No contact info found');
            return { success: true, data: {} };
        }
    } catch (error) {
        console.error('❌ Error getting contact info:', error);
        return { success: false, error: error.message };
    }
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.firebaseDB = {
        // Portfolio
        addPortfolioItem,
        getPortfolioItems,
        deletePortfolioItem,
        
        // Services
        addService,
        getServices,
        updateService,
        deleteService,
        
        // Testimonials
        addTestimonial,
        getTestimonials,
        deleteTestimonial,
        updateTestimonial,
        uploadTestimonialImage,
        
        // About
        updateAboutInfo,
        getAboutInfo,
        
        // Contact
        updateContactInfo,
        getContactInfo,
        
        // Test function
        testConnection: async function() {
            try {
                initializeFirebase();
                const testDoc = await db.collection('testimonials').limit(1).get();
                console.log('✅ Firebase connection test successful');
                return { success: true, message: 'Firebase connection working' };
            } catch (error) {
                console.error('❌ Firebase connection test failed:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Add test testimonial
        addTestTestimonial: async function() {
            const testData = {
                clientName: 'Test Client',
                testimonialText: 'This is a test testimonial to verify the functionality is working correctly.',
                rating: 5,
                clientImage: null
            };
            
            console.log('🧪 Adding test testimonial...');
            const result = await addTestimonial(testData);
            if (result.success) {
                console.log('✅ Test testimonial added successfully');
            } else {
                console.error('❌ Failed to add test testimonial:', result.error);
            }
            return result;
        }
    };
    
    console.log('✅ firebaseDB object created and exported to window');
}
