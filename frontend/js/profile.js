document.addEventListener('DOMContentLoaded', async () => {
    // Tab switching
    const editProfileTab = document.getElementById('editProfileTab');
    const changePasswordTab = document.getElementById('changePasswordTab');
    const manageListingsTab = document.getElementById('manageListingsTab');
    const editProfileContent = document.getElementById('editProfileContent');
    const changePasswordContent = document.getElementById('changePasswordContent');
    const manageListingsContent = document.getElementById('manageListingsContent');
    const viewCommentsTab = document.getElementById('viewCommentsTab');
    const viewCommentsContent = document.getElementById('viewCommentsContent');
    const commentsErrorMessage = document.getElementById('commentsErrorMessage');
    const commentsContainer = document.getElementById('commentsContainer');

    // Function to load profile data
    const loadProfileData = async () => {
        const errorMessage = document.getElementById('errorMessage');
        try {
            const res = await fetch(`${API_URL.replace('/auth', '')}/user/profile`, {
                credentials: 'include'
            });
            if (res.ok) {
                const user = await res.json();
                document.getElementById('firstname').value = user.firstname || '';
                document.getElementById('lastname').value = user.lastname || '';
                document.getElementById('email').value = user.email || '';
                errorMessage.style.display = 'none';
            } else {
                errorMessage.textContent = 'Failed to load profile info.';
                errorMessage.style.display = 'block';
            }
        } catch (err) {
            errorMessage.textContent = 'Error loading profile info.';
            errorMessage.style.display = 'block';
        }
    };

    // Function to load user's listings
    const loadListings = async () => {
        const listingsErrorMessage = document.getElementById('listingsErrorMessage');
        const listingsContainer = document.getElementById('listingsContainer');
        
        try {
            const res = await fetch(`${API_URL.replace('/auth', '')}/user/listings`, {
                credentials: 'include'
            });
            
            if (res.ok) {
                const listings = await res.json();
                
                if (listings.length === 0) {
                    listingsContainer.innerHTML = '<p>You have no listings yet.</p>';
                } else {
                    const listingsHTML = listings.map(listing => `
                        <div class="listing-card" data-listing-id="${listing._id}">
                            <h3>${listing.title}</h3>
                            <p>Brand: ${listing.brand}</p>
                            <p>Price: $${listing.price}</p>
                            <p>Stock: ${Math.floor(listing.stock)}</p>
                            <div class="listing-actions">
                                <button class="toggle-btn" 
                                        onclick="toggleListing('${listing._id}')"
                                        ${listing.stock === 0 ? 'disabled' : ''}>
                                    ${listing.disabled ? 'Enable' : 'Disable'}
                                </button>
                                <button class="delete-btn" 
                                        onclick="deleteListing('${listing._id}')">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `).join('');
                    
                    listingsContainer.innerHTML = listingsHTML;
                }
                listingsErrorMessage.style.display = 'none';
            } else {
                throw new Error('Failed to load listings');
            }
        } catch (err) {
            listingsErrorMessage.textContent = 'Error loading listings.';
            listingsErrorMessage.style.display = 'block';
        }
    };
    window.loadListings = loadListings;

    // Function to load comments for user's listings
    const loadComments = async () => {
        commentsErrorMessage.style.display = 'none';
        commentsContainer.innerHTML = '';
        
        try {
            const res = await fetch(`${API_URL.replace('/auth', '')}/user/comments/get-listing-comments`, {
                credentials: 'include'
            });
            
            if (!res.ok) throw new Error('Failed to load comments');
            
            const listings = await res.json();
            
            if (listings.length === 0) {
                commentsContainer.innerHTML = '<p>You have no listings with comments yet.</p>';
                return;
            }

            const commentsHTML = listings.map(listing => `
                <div class="listing-card">
                    <h3>${listing.title}</h3>
                    <div class="comments-list">
                        ${listing.reviews.length === 0 
                            ? '<p>No comments yet.</p>'
                            : listing.reviews.map(review => `
                                <div class="comment-card ${review.hidden ? 'hidden' : 'visible'}">
                                    <div class="reviewer">
                                        <strong>Reviewer:</strong> ${review.reviewer}
                                    </div>
                                    <div class="rating">
                                        <strong>Rating:</strong> ${review.rating}
                                    </div>
                                    <div class="comment">
                                        <strong>Comment:</strong> ${review.comment}
                                    </div>
                                    <div class="status">
                                        <strong>Status:</strong> ${review.hidden ? 'Hidden' : 'Visible'}
                                    </div>
                                    <button class="toggle-comment-btn" 
                                            onclick="toggleCommentVisibility('${listing._id}', '${review.reviewId}', ${review.hidden})">
                                        ${review.hidden ? 'Show' : 'Hide'}
                                    </button>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            `).join('');

            commentsContainer.innerHTML = commentsHTML;
        } catch (err) {
            commentsErrorMessage.textContent = err.message || 'Error loading comments.';
            commentsErrorMessage.style.display = 'block';
        }
    };
    window.loadComments = loadComments;

    // Load profile data on initial page load
    await loadProfileData();

    // Utility function to clear active classes from all tabs and contents
    function clearTabActive() {
        [editProfileTab, changePasswordTab, manageListingsTab, viewCommentsTab].forEach(tab => tab.classList.remove('active'));
        [editProfileContent, changePasswordContent, manageListingsContent, viewCommentsContent].forEach(content => content.classList.remove('active'));
    }

    // Tab switching logic
    editProfileTab.addEventListener('click', async () => {
        clearTabActive();
        editProfileTab.classList.add('active');
        editProfileContent.classList.add('active');
        await loadProfileData();
    });

    changePasswordTab.addEventListener('click', () => {
        clearTabActive();
        changePasswordTab.classList.add('active');
        changePasswordContent.classList.add('active');
    });

    manageListingsTab.addEventListener('click', async () => {
        clearTabActive();
        manageListingsTab.classList.add('active');
        manageListingsContent.classList.add('active');
        await loadListings();
    });

    viewCommentsTab.addEventListener('click', async () => {
        clearTabActive();
        viewCommentsTab.classList.add('active');
        viewCommentsContent.classList.add('active');
        await loadComments();
    });

    // Edit Profile Form logic
    const editProfileForm = document.getElementById('editProfileForm');
    const submitButton = document.getElementById('submitButton');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        submitButton.disabled = true;

        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_URL.replace('/auth', '')}/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ firstname, lastname, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                successMessage.textContent = data.message || 'Profile updated!';
                successMessage.style.display = 'block';
                await loadProfileData();
            } else {
                errorMessage.textContent = data.message || 'Failed to update profile.';
                errorMessage.style.display = 'block';
            }
        } catch (err) {
            errorMessage.textContent = 'Error updating profile.';
            errorMessage.style.display = 'block';
        } finally {
            submitButton.disabled = false;
        }
    });

    // Change Password Form logic
    const changePasswordForm = document.getElementById('changePasswordForm');
    const pwSubmitButton = document.getElementById('pwSubmitButton');
    const pwErrorMessage = document.getElementById('pwErrorMessage');
    const pwSuccessMessage = document.getElementById('pwSuccessMessage');

    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        pwErrorMessage.style.display = 'none';
        pwSuccessMessage.style.display = 'none';
        pwSubmitButton.disabled = true;

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;

        try {
            const res = await fetch(`${API_URL.replace('/auth', '')}/user/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ currentpassword: currentPassword, newpassword: newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                pwSuccessMessage.textContent = data.message || 'Password changed! Check your email for a notification.';
                pwSuccessMessage.style.display = 'block';
                changePasswordForm.reset();
            } else {
                pwErrorMessage.textContent = data.message || 'Failed to change password.';
                pwErrorMessage.style.display = 'block';
            }
        } catch (err) {
            pwErrorMessage.textContent = 'Error changing password.';
            pwErrorMessage.style.display = 'block';
        } finally {
            pwSubmitButton.disabled = false;
        }
    });

    // Create Listing Form logic
    const createListingForm = document.getElementById('createListingForm');
    const createListingButton = document.getElementById('createListingButton');
    const listingsSuccessMessage = document.getElementById('listingsSuccessMessage');

    createListingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        listingsSuccessMessage.style.display = 'none';
        createListingButton.disabled = true;

        const formData = new FormData();
        formData.append('title', document.getElementById('listingTitle').value);
        formData.append('brand', document.getElementById('listingBrand').value);
        formData.append('price', document.getElementById('listingPrice').value);
        formData.append('stock', document.getElementById('listingStock').value);
        formData.append('image', document.getElementById('listingImage').files[0]);

        try {
            const res = await fetch(`${API_URL.replace('/auth', '')}/user/create-listing`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                listingsSuccessMessage.textContent = 'Listing created successfully!';
                listingsSuccessMessage.style.display = 'block';
                createListingForm.reset();
                await loadListings();
                setTimeout(() => {
                    listingsSuccessMessage.style.display = 'none';
                }, 3000);
            } else {
                throw new Error(data.message || 'Failed to create listing');
            }
        } catch (err) {
            listingsErrorMessage.textContent = err.message;
            listingsErrorMessage.style.display = 'block';
        } finally {
            createListingButton.disabled = false;
        }
    });

    // Sign out button event listener
    const signoutButton = document.getElementById('signoutButton');
    if (signoutButton) {
        signoutButton.addEventListener('click', () => {
            auth.logout();
        });
    }
});

// Global functions for listing actions
async function toggleListing(listingId) {
    try {
        const res = await fetch(`${API_URL.replace('/auth', '')}/user/listings/${listingId}/toggle`, {
            method: 'PATCH',
            credentials: 'include'
        });
        if (res.ok) {
            await loadListings();
        } else {
            throw new Error('Failed to toggle listing status');
        }
    } catch (err) {
        const listingsErrorMessage = document.getElementById('listingsErrorMessage');
        listingsErrorMessage.textContent = err.message;
        listingsErrorMessage.style.display = 'block';
    }
}

async function deleteListing(listingId) {
    if (!confirm('Are you sure you want to delete this listing?')) {
        return;
    }
    
    try {
        const res = await fetch(`${API_URL.replace('/auth', '')}/user/listings/${listingId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (res.ok) {
            await loadListings();
        } else {
            throw new Error('Failed to delete listing');
        }
    } catch (err) {
        const listingsErrorMessage = document.getElementById('listingsErrorMessage');
        listingsErrorMessage.textContent = err.message;
        listingsErrorMessage.style.display = 'block';
    }
}

// Add global function for toggling comment visibility
window.toggleCommentVisibility = async (listingId, reviewId, currentlyHidden) => {
    try {
        const res = await fetch(`${API_URL.replace('/auth', '')}/user/comments/${listingId}/${reviewId}/toggle`, {
            method: 'PATCH',
            credentials: 'include'
        });
        if (res.ok) {
            await loadComments();
        } else {
            throw new Error('Failed to toggle comment visibility');
        }
    } catch (err) {
        commentsErrorMessage.textContent = err.message;
        commentsErrorMessage.style.display = 'block';
    }
}; 