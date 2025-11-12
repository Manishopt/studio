// Firebase Database Helper for Admin Panel Features
// This file handles all Firebase Firestore operations

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_oBr_xQZZyFKBeMS9Vqa_IgiUUCofrQY",
    authDomain: "studio-66a62.firebaseapp.com",
    projectId: "studio-66a62",
    storageBucket: "studio-66a62.firebasestorage.app",
    messagingSenderId: "472272986177",
    appId: "1:472272986177:web:96823be1a135b00bb466c0"
};

// Initialize Firebase
let db;
let initialized = false;

function initializeFirebase() {
    if (initialized) return;
    
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        initialized = true;
        console.log('✅ Firebase initialized successfully');
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
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
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
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
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
 * Add a new testimonial
 * @param {Object} testimonialData - { clientName, testimonialText, rating }
 */
async function addTestimonial(testimonialData) {
    try {
        initializeFirebase();
        const docRef = await db.collection('testimonials').add({
            clientName: testimonialData.clientName,
            testimonialText: testimonialData.testimonialText,
            rating: testimonialData.rating || 5,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Testimonial added with ID:', docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('❌ Error adding testimonial:', error);
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
        
        // About
        updateAboutInfo,
        getAboutInfo,
        
        // Contact
        updateContactInfo,
        getContactInfo
    };
}
