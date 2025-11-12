// ==========================================
// EXAMPLE: Complete Testimonials Integration with Firebase
// Copy this code into your admin-panel.html <script> section
// ==========================================

// ========== 1. FORM SUBMIT HANDLER ==========
// Replace the existing testimonial form handler with this:

const testimonialForm = document.getElementById('testimonialForm');
testimonialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const clientName = document.getElementById('clientName').value;
    const testimonialText = document.getElementById('testimonialText').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Disable button during submission
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
        // Save to Firebase
        const result = await firebaseDB.addTestimonial({
            clientName: clientName,
            testimonialText: testimonialText,
            rating: 5
        });
        
        if (result.success) {
            // Show success message
            const alert = document.getElementById('testimonialsAlert');
            alert.textContent = 'Testimonial added successfully!';
            alert.style.display = 'block';
            
            // Reset form
            testimonialForm.reset();
            
            // Reload testimonials table
            await loadTestimonialsFromFirebase();
            
            setTimeout(() => {
                alert.style.display = 'none';
            }, 3000);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        alert('Error adding testimonial: ' + error.message);
        console.error('Error:', error);
    } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save"></i> Add Testimonial';
    }
});

// ========== 2. LOAD TESTIMONIALS FROM FIREBASE ==========
async function loadTestimonialsFromFirebase() {
    try {
        const result = await firebaseDB.getTestimonials();
        
        if (result.success) {
            const table = document.getElementById('testimonialsTable');
            
            // Clear existing rows (except header)
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            
            // Add testimonials from Firebase
            result.data.forEach(testimonial => {
                const newRow = table.insertRow();
                newRow.setAttribute('data-testimonial-id', testimonial.id);
                
                newRow.innerHTML = `
                    <td>${testimonial.clientName}</td>
                    <td>${testimonial.testimonialText.substring(0, 50)}${testimonial.testimonialText.length > 50 ? '...' : ''}</td>
                    <td class="table-actions">
                        <button class="btn-edit" onclick="editTestimonial('${testimonial.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="deleteTestimonialFromFirebase('${testimonial.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
            });
            
            console.log(`✅ Loaded ${result.data.length} testimonials from Firebase`);
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

// ========== 3. DELETE TESTIMONIAL ==========
async function deleteTestimonialFromFirebase(testimonialId) {
    if (!confirm('Are you sure you want to delete this testimonial?')) {
        return;
    }
    
    try {
        const result = await firebaseDB.deleteTestimonial(testimonialId);
        
        if (result.success) {
            // Show success message
            const alert = document.getElementById('testimonialsAlert');
            alert.textContent = 'Testimonial deleted successfully!';
            alert.style.display = 'block';
            
            // Reload testimonials
            await loadTestimonialsFromFirebase();
            
            setTimeout(() => {
                alert.style.display = 'none';
            }, 2000);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        alert('Error deleting testimonial: ' + error.message);
        console.error('Error:', error);
    }
}

// ========== 4. EDIT TESTIMONIAL (OPTIONAL) ==========
async function editTestimonial(testimonialId) {
    // Get the row
    const row = document.querySelector(`tr[data-testimonial-id="${testimonialId}"]`);
    const clientName = row.cells[0].textContent;
    const testimonialText = row.cells[1].textContent;
    
    // Populate form with existing data
    document.getElementById('clientName').value = clientName;
    document.getElementById('testimonialText').value = testimonialText;
    
    // Scroll to form
    document.getElementById('testimonialForm').scrollIntoView({ behavior: 'smooth' });
    
    // TODO: Add update functionality instead of creating new entry
    alert('Edit mode: Modify the text and submit to create a new version. Delete the old one manually.');
}

// ========== 5. LOAD ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', function() {
    // Load testimonials when page loads
    loadTestimonialsFromFirebase();
    
    console.log('✅ Testimonials module initialized with Firebase');
});

// ==========================================
// USAGE INSTRUCTIONS:
// ==========================================
// 1. Make sure firebase-db.js is loaded in your HTML
// 2. Make sure Firebase SDK scripts are loaded
// 3. Copy this code into admin-panel.html <script> section
// 4. Update your Firebase config in firebase-db.js
// 5. Test by adding a testimonial in the admin panel
// 6. Check Firebase Console to see the data
// ==========================================
