import React, { useState, useEffect } from 'react';
import './ProfileView.css';

// ProfileView component handles user profile management, listings, and comments
function ProfileView({ onLogout, onUserUpdate, onBackToHome }) {
    // State for tabs, user info, listings, comments, and UI feedback
    const [activeTab, setActiveTab] = useState('editProfile');
    const [user, setUser] = useState({
        firstname: '',
        lastname: '',
        email: ''
    });
    const [listings, setListings] = useState([]);
    const [comments, setComments] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Handle token expiration and redirect to login
    const handleTokenExpiration = () => {
        localStorage.removeItem('user');
        setErrorMessage('Your session has expired. Please log in again.');
        setTimeout(() => {
            if (onLogout) onLogout();
        }, 3000);
    };

    // Load profile data from backend
    const loadProfileData = async () => {
        try {
            // Fetch user profile info
            const res = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/user/profile`, {
                credentials: 'include'
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                setErrorMessage('');
            } else {
                if (res.status === 403) {
                    handleTokenExpiration();
                } else {
                    const errorData = await res.json();
                    setErrorMessage(errorData.message || 'Failed to load profile info.');
                }
            }
        } catch (err) {
            setErrorMessage('Error loading profile info.');
        }
    };

    // Load user's listings from backend
    const loadListings = async () => {
        try {
            const res = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/user/listings`, {
                credentials: 'include'
            });
            if (res.ok) {
                const listingsData = await res.json();
                setListings(listingsData);
                setErrorMessage('');
            } else {
                if (res.status === 403) {
                    handleTokenExpiration();
                } else {
                    throw new Error('Failed to load listings');
                }
            }
        } catch (err) {
            setErrorMessage('Error loading listings.');
        }
    };

    // Load comments for user's listings from backend
    const loadComments = async () => {
        try {
            const res = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/user/comments/get-listing-comments`, {
                credentials: 'include'
            });
            if (!res.ok) {
                if (res.status === 403) {
                    handleTokenExpiration();
                } else {
                    throw new Error('Failed to load comments');
                }
            }
            const commentsData = await res.json();
            setComments(commentsData);
            setErrorMessage('');
        } catch (err) {
            setErrorMessage('Error loading comments.');
        }
    };

    // Load initial profile data on mount
    useEffect(() => {
        loadProfileData();
    }, []);

    // Load listings or comments when tab changes
    useEffect(() => {
        if (activeTab === 'manageListings') {
            loadListings();
        } else if (activeTab === 'viewComments') {
            loadComments();
        }
    }, [activeTab]);

    // Handle profile update form submission
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        const formData = new FormData(e.target);
        const data = {
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            email: formData.get('email'),
            password: formData.get('password')
        };
        try {
            const res = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const responseData = await res.json();
            if (res.ok) {
                setSuccessMessage(responseData.message || 'Profile updated!');
                await loadProfileData();
                // Update user in localStorage and App.js
                const updatedUser = { ...user, firstname: data.firstname, lastname: data.lastname, email: data.email };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                if (onUserUpdate) onUserUpdate(updatedUser);
                // Clear the current password field
                e.target.password.value = '';
            } else {
                if (res.status === 403) {
                    handleTokenExpiration();
                } else {
                    setErrorMessage(responseData.message || 'Failed to update profile.');
                }
            }
        } catch (err) {
            setErrorMessage('Error updating profile.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle password change form submission
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newPassword = formData.get('newPassword');
        
        // Add confirmation dialog
        if (!window.confirm('Are you sure you want to change your password?')) {
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        
        const data = {
            currentpassword: formData.get('currentPassword'),
            newpassword: newPassword
        };
        try {
            const res = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/user/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const responseData = await res.json();
            if (res.ok) {
                setSuccessMessage(responseData.message || 'Password changed! Check your email for a notification.');
                e.target.reset();
            } else {
                if (res.status === 403) {
                    handleTokenExpiration();
                } else {
                    setErrorMessage(responseData.message || 'Failed to change password.');
                }
            }
        } catch (err) {
            setErrorMessage('Error changing password.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle listing creation form submission
    const handleCreateListing = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        const formData = new FormData(e.target);
        try {
            const res = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/user/create-listing`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMessage('Listing created successfully!');
                e.target.reset();
                await loadListings();
            } else {
                if (res.status === 403) {
                    handleTokenExpiration();
                } else {
                    throw new Error(data.message || 'Failed to create listing');
                }
            }
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle listing enable/disable
    const handleToggleListing = async (listingId) => {
        try {
            const res = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/user/listings/${listingId}/toggle`, {
                method: 'PATCH',
                credentials: 'include'
            });
            if (res.ok) {
                await loadListings();
            } else {
                if (res.status === 403) {
                    handleTokenExpiration();
                } else {
                    throw new Error('Failed to toggle listing status');
                }
            }
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    // Handle listing deletion
    const handleDeleteListing = async (listingId) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                const res = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/user/listings/${listingId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (res.ok) {
                    await loadListings();
                } else {
                    if (res.status === 403) {
                        handleTokenExpiration();
                    } else {
                        throw new Error('Failed to delete listing');
                    }
                }
            } catch (err) {
                setErrorMessage(err.message);
            }
        }
    };

    // Handle comment visibility toggle
    const handleToggleComment = async (listingId, reviewId) => {
        try {
            const res = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/user/comments/${listingId}/${reviewId}/toggle`, {
                method: 'PATCH',
                credentials: 'include'
            });
            if (res.ok) {
                await loadComments();
            } else {
                if (res.status === 403) {
                    handleTokenExpiration();
                } else {
                    throw new Error('Failed to toggle comment visibility');
                }
            }
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    // Clear success and error messages after 5 seconds
    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    // Render the profile page with tabs and forms
    return (
        <div className="profile-root">
            <main className="profile-main">
                <div className="profile-header">
                    <h1>Profile Dashboard</h1>
                    <button 
                        className="return-home-btn"
                        onClick={onBackToHome}
                    >
                        Return to Home
                    </button>
                </div>
                {/* Tab bar for navigation */}
                <div className="tab-bar">
                    <div className={`tab${activeTab === 'editProfile' ? ' active' : ''}`} onClick={() => setActiveTab('editProfile')}>Edit Profile</div>
                    <div className={`tab${activeTab === 'changePassword' ? ' active' : ''}`} onClick={() => setActiveTab('changePassword')}>Change Password</div>
                    <div className={`tab${activeTab === 'manageListings' ? ' active' : ''}`} onClick={() => setActiveTab('manageListings')}>Manage Listings</div>
                    <div className={`tab${activeTab === 'viewComments' ? ' active' : ''}`} onClick={() => setActiveTab('viewComments')}>View Comments</div>
                </div>
                {/* Edit Profile Tab */}
                <div className={`tab-content${activeTab === 'editProfile' ? ' active' : ''}`}>
                    {activeTab === 'editProfile' && (
                        <form onSubmit={handleProfileUpdate} className="auth-form">
                            {errorMessage && <div className="error-message">{errorMessage}</div>}
                            {successMessage && <div className="success-message">{successMessage}</div>}
                            <div className="form-group">
                                <label htmlFor="firstname">First Name</label>
                                <input type="text" id="firstname" name="firstname" value={user.firstname} onChange={e => setUser({ ...user, firstname: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastname">Last Name</label>
                                <input type="text" id="lastname" name="lastname" value={user.lastname} onChange={e => setUser({ ...user, lastname: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Current Password</label>
                                <input type="password" id="password" name="password" placeholder="Enter current password to confirm changes" required />
                            </div>
                            <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? 'Updating...' : 'Update Profile'}</button>
                        </form>
                    )}
                </div>
                {/* Change Password Tab */}
                <div className={`tab-content${activeTab === 'changePassword' ? ' active' : ''}`}>
                    {activeTab === 'changePassword' && (
                        <form onSubmit={handlePasswordChange} className="auth-form">
                            {errorMessage && <div className="error-message">{errorMessage}</div>}
                            {successMessage && <div className="success-message">{successMessage}</div>}
                            <div className="form-group">
                                <label htmlFor="currentPassword">Current Password</label>
                                <input type="password" id="currentPassword" name="currentPassword" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input type="password" id="newPassword" name="newPassword" required />
                            </div>
                            <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? 'Changing...' : 'Change Password'}</button>
                        </form>
                    )}
                </div>
                {/* Manage Listings Tab */}
                <div className={`tab-content${activeTab === 'manageListings' ? ' active' : ''}`}>
                    {activeTab === 'manageListings' && (
                        <div className="listings-container">
                            <form onSubmit={handleCreateListing} className="auth-form">
                                <h3>Create New Listing</h3>
                                <div className="form-group">
                                    <label htmlFor="listingTitle">Title</label>
                                    <input type="text" id="listingTitle" name="title" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="listingBrand">Brand</label>
                                    <input type="text" id="listingBrand" name="brand" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="listingPrice">Price</label>
                                    <input type="number" id="listingPrice" name="price" min="0" step="0.01" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="listingStock">Stock</label>
                                    <input type="number" id="listingStock" name="stock" min="0" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="listingImage">Image</label>
                                    <input type="file" id="listingImage" name="image" accept="image/*" required />
                                </div>
                                <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Listing'}</button>
                            </form>
                            <div className="listings-grid">
                                {listings.length === 0 ? (
                                    <p>You have no listings yet.</p>
                                ) : (
                                    listings.map(listing => (
                                        <div key={listing._id} className="listing-card">
                                            <h3>{listing.title}</h3>
                                            <p>Brand: {listing.brand}</p>
                                            <p>Price: ${listing.price}</p>
                                            <p>Stock: {Math.floor(listing.stock)}</p>
                                            <div className="listing-actions">
                                                <button className="toggle-btn" onClick={() => handleToggleListing(listing._id)} disabled={listing.stock === 0}>{listing.disabled ? 'Enable' : 'Disable'}</button>
                                                <button className="delete-btn" onClick={() => handleDeleteListing(listing._id)}>Delete</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* View Comments Tab */}
                <div className={`tab-content${activeTab === 'viewComments' ? ' active' : ''}`}>
                    {activeTab === 'viewComments' && (
                        <div className="comments-container">
                            {comments.length === 0 ? (
                                <p>You have no listings with comments yet.</p>
                            ) : (
                                comments.map(listing => (
                                    <div key={listing._id} className="listing-card">
                                        <h3>{listing.title}</h3>
                                        <div className="comments-list">
                                            {listing.reviews.length === 0 ? (
                                                <p>No comments yet.</p>
                                            ) : (
                                                listing.reviews.map(review => (
                                                    <div key={review.reviewId} className={`comment-card ${review.hidden ? 'hidden' : 'visible'}`}>
                                                        <div className="reviewer"><strong>Reviewer:</strong> {review.reviewer}</div>
                                                        <div className="rating"><strong>Rating:</strong> {review.rating}</div>
                                                        <div className="comment"><strong>Comment:</strong> {review.comment}</div>
                                                        <div className="status"><strong>Status:</strong> {review.hidden ? 'Hidden' : 'Visible'}</div>
                                                        <button className="toggle-comment-btn" onClick={() => handleToggleComment(listing._id, review.reviewId)}>{review.hidden ? 'Show' : 'Hide'}</button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default ProfileView; 