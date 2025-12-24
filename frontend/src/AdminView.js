/**
 * AdminView Component
 * A React component that provides an administrative interface for managing users, listings, and reviews.
 * Features include:
 * - User management: view, search, edit, and delete user accounts
 * - Listing management: view, search, edit, and delete product listings
 * - Review management: view, search, and toggle visibility of product reviews
 */
import React, { useState, useEffect } from 'react';
import './AdminView.css';

function AdminView() {
    // State variables for managing UI and data
    const [activeTab, setActiveTab] = useState('userManagement');  // Current active tab
    const [users, setUsers] = useState([]);                        // List of users
    const [allUsers, setAllUsers] = useState([]);                  // Store all users
    const [listings, setListings] = useState([]);                  // List of product listings
    const [allListings, setAllListings] = useState([]);            // Store all listings
    const [reviews, setReviews] = useState([]);                    // List of reviews
    const [allReviews, setAllReviews] = useState([]);              // Store all reviews
    const [userSearchQuery, setUserSearchQuery] = useState('');    // User search input
    const [listingSearchQuery, setListingSearchQuery] = useState(''); // Listing search input
    const [reviewSearchQuery, setReviewSearchQuery] = useState('');   // Review search input
    const [editingUser, setEditingUser] = useState(null);         // User being edited
    const [editingListing, setEditingListing] = useState(null);   // Listing being edited
    const [error, setError] = useState('');                       // Error message
    const [success, setSuccess] = useState('');                   // Success message
    const [salesLogs, setSalesLogs] = useState([]);
    const [salesError, setSalesError] = useState('');  // Add error state for sales

    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Add sorting state variables
    const [userSortConfig, setUserSortConfig] = useState({ key: null, direction: null });
    const [listingSortConfig, setListingSortConfig] = useState({ key: null, direction: null });
    const [reviewSortConfig, setReviewSortConfig] = useState({ key: null, direction: null });
    const [salesSortConfig, setSalesSortConfig] = useState({ key: null, direction: null });

    // Handles sorting of users in the table
    const handleUserSort = (key) => {
        let direction = 'ascending';
        if (userSortConfig.key === key) {
            if (userSortConfig.direction === 'ascending') {
                direction = 'descending';
            } else if (userSortConfig.direction === 'descending') {
                setUserSortConfig({ key: null, direction: null });
                setUsers([...allUsers]);
                return;
            }
        }
        setUserSortConfig({ key, direction });
        const sortedUsers = [...users].sort((a, b) => {
            if (key === 'name') {
                const nameA = `${a.firstname} ${a.lastname}`.toLowerCase();
                const nameB = `${b.firstname} ${b.lastname}`.toLowerCase();
                return direction === 'ascending' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            }
            if (key === 'registrationDate' || key === 'lastLogin') {
                const dateA = new Date(a[key] || 0);
                const dateB = new Date(b[key] || 0);
                return direction === 'ascending' ? dateA - dateB : dateB - dateA;
            }
            const valueA = a[key]?.toLowerCase() ?? '';
            const valueB = b[key]?.toLowerCase() ?? '';
            return direction === 'ascending' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
        setUsers(sortedUsers);
    };

    // Handles sorting of listings in the table
    const handleListingSort = (key) => {
        let direction = 'ascending';
        if (listingSortConfig.key === key) {
            if (listingSortConfig.direction === 'ascending') {
                direction = 'descending';
            } else if (listingSortConfig.direction === 'descending') {
                setListingSortConfig({ key: null, direction: null });
                setListings([...allListings]);
                return;
            }
        }
        setListingSortConfig({ key, direction });
        const sortedListings = [...listings].sort((a, b) => {
            if (key === 'price' || key === 'stock') {
                return direction === 'ascending' ? a[key] - b[key] : b[key] - a[key];
            }
            if (key === 'disabled') {
                // For boolean values, false comes before true
                if (direction === 'ascending') {
                    return (a[key] === b[key]) ? 0 : a[key] ? 1 : -1;
                } else {
                    return (a[key] === b[key]) ? 0 : a[key] ? -1 : 1;
                }
            }
            const valueA = a[key]?.toLowerCase() ?? '';
            const valueB = b[key]?.toLowerCase() ?? '';
            return direction === 'ascending' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
        setListings(sortedListings);
    };

    // Handles sorting of reviews in the table
    const handleReviewSort = (key) => {
        let direction = 'ascending';
        if (reviewSortConfig.key === key) {
            if (reviewSortConfig.direction === 'ascending') {
                direction = 'descending';
            } else if (reviewSortConfig.direction === 'descending') {
                setReviewSortConfig({ key: null, direction: null });
                setReviews([...allReviews]);
                return;
            }
        }
        setReviewSortConfig({ key, direction });
        const sortedReviews = [...reviews].sort((a, b) => {
            if (key === 'rating') {
                return direction === 'ascending' ? a[key] - b[key] : b[key] - a[key];
            }
            if (key === 'hidden') {
                // For boolean values, false comes before true
                if (direction === 'ascending') {
                    return (a[key] === b[key]) ? 0 : a[key] ? 1 : -1;
                } else {
                    return (a[key] === b[key]) ? 0 : a[key] ? -1 : 1;
                }
            }
            const valueA = a[key]?.toLowerCase() ?? '';
            const valueB = b[key]?.toLowerCase() ?? '';
            return direction === 'ascending' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
        setReviews(sortedReviews);
    };

    // Handles sorting of sales logs in the table
    const handleSalesSort = (key) => {
        let direction = 'ascending';
        if (salesSortConfig.key === key) {
            if (salesSortConfig.direction === 'ascending') {
                direction = 'descending';
            } else if (salesSortConfig.direction === 'descending') {
                setSalesSortConfig({ key: null, direction: null });
                setSalesLogs([...salesLogs]);
                return;
            }
        }
        setSalesSortConfig({ key, direction });
        const sortedLogs = [...salesLogs].sort((a, b) => {
            if (key === 'timestamp') {
                const dateA = new Date(a[key]);
                const dateB = new Date(b[key]);
                return direction === 'ascending' ? dateA - dateB : dateB - dateA;
            }
            if (key === 'total') {
                return direction === 'ascending' ? a[key] - b[key] : b[key] - a[key];
            }
            if (key === 'buyer') {
                const nameA = `${a.user.firstname} ${a.user.lastname}`.toLowerCase();
                const nameB = `${b.user.firstname} ${b.user.lastname}`.toLowerCase();
                return direction === 'ascending' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            }
            return 0;
        });
        setSalesLogs(sortedLogs);
    };

    // Handles changing the current page for pagination
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Handles changing the number of items per page
    const handleItemsPerPageChange = (newSize) => {
        setItemsPerPage(Number(newSize));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Returns a paginated slice of the provided data array
    const getPaginatedData = (data) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    // Fetches all users from the backend
    const fetchUsers = async () => {
        try {
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/admin/user?limit=1000`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setAllUsers(data.users);
                setUsers(data.users);
            } else {
                if (response.status === 401 || response.status === 403) {
                    handleTokenExpiration();
                } else {
                    setError(data.message);
                }
            }
        } catch (err) {
            setError('Failed to fetch users');
        }
    };

    // Searches users based on the current search query
    const searchUsers = async () => {
        if (!userSearchQuery.trim()) {
            fetchUsers();
            return;
        }
        try {
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/admin/user/search?q=${userSearchQuery}&limit=1000`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setAllUsers(data.users);
                setUsers(data.users);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to search users');
        }
    };

    // Fetches all listings from the backend
    const fetchListings = async () => {
        try {
            const url = `http://localhost:${process.env.REACT_APP_API_PORT}/admin/listings?limit=1000${listingSearchQuery ? `&q=${encodeURIComponent(listingSearchQuery)}` : ''}`;
            
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!user || user.role !== 'admin') {
                handleTokenExpiration();
                return;
            }

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    handleTokenExpiration();
                } else {
                    setError(data.message || 'Failed to fetch listings');
                }
                return;
            }
            
            if (data.listings) {
                setAllListings(data.listings);
                setListings(data.listings);
            } else {
                setError('No listings data received');
            }
        } catch (err) {
            setError('Failed to fetch listings: ' + err.message);
        }
    };

    // Searches listings based on the current search query
    const searchListings = async () => {
        if (!listingSearchQuery.trim()) {
            fetchListings();
            return;
        }
        try {
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/admin/listings?q=${encodeURIComponent(listingSearchQuery)}&limit=1000`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setAllListings(data.listings);
                setListings(data.listings);
            } else {
                if (response.status === 403) {
                    handleTokenExpiration();
                } else {
                    setError(data.message);
                }
            }
        } catch (err) {
            setError('Failed to search listings');
        }
    };

    // Fetches all reviews from the backend
    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/admin/reviews?limit=1000`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setAllReviews(data.reviews);
                setReviews(data.reviews);
            } else {
                if (response.status === 401 || response.status === 403) {
                    handleTokenExpiration();
                } else {
                    setError(data.message);
                }
            }
        } catch (err) {
            setError('Failed to fetch reviews');
        }
    };

    // Searches reviews based on the current search query
    const searchReviews = async () => {
        if (!reviewSearchQuery.trim()) {
            fetchReviews();
            return;
        }
        try {
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/admin/reviews/search?q=${encodeURIComponent(reviewSearchQuery)}&limit=1000`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 403) {
                handleTokenExpiration();
                return;
            }

            const data = await response.json();
      
            if (response.ok) {
                setAllReviews(data.reviews);
                setReviews(data.reviews);
            } else {
                setError(data.message || 'Failed to search reviews');
            }
        } catch (err) {
            setError('Failed to search reviews: ' + err.message);
        }
    };

    // Toggles the visibility (hidden/visible) of a review
    const toggleReviewVisibility = async (reviewId, currentHidden) => {
        try {
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/admin/reviews/${reviewId}/visibility`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hidden: !currentHidden })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('Review visibility updated successfully');
                // If there's a search query, use searchReviews instead of fetchReviews
                if (reviewSearchQuery.trim()) {
                    await searchReviews();
                } else {
                    await fetchReviews();
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to update review visibility');
        }
    };

    // Fetches all sales logs from the backend
    const fetchSalesLogs = async () => {
        try {
            setSalesError('');  // Clear any previous errors
            const response = await fetch(
                `http://localhost:${process.env.REACT_APP_API_PORT}/admin/logs?limit=1000`,
                {
                    credentials: 'include'
                }
            );
            if (response.status === 401 || response.status === 403) {
                handleTokenExpiration();
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setSalesLogs(data.logs || []);
            } else {
                setSalesError(data.message || 'Failed to fetch sales logs');
            }
        } catch (err) {
            setSalesError('Error fetching sales logs: ' + err.message);
            setSalesLogs([]);
        }
    };

    // Checks if the user is an admin and handles token expiration
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            handleTokenExpiration();
            return;
        }
    }, []);

    // Fetches initial data when the component mounts or tab changes
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (activeTab === 'userManagement') {
                    await fetchUsers();
                } else if (activeTab === 'listingManagement') {
                    await fetchListings();
                } else if (activeTab === 'reviewManagement') {
                    await fetchReviews();
                } else if (activeTab === 'sales') {
                    await fetchSalesLogs();
                }
            } catch (err) {
                handleTokenExpiration();
            }
        };

        fetchInitialData();
    }, [activeTab]);

    // Handles token expiration by redirecting to login and clearing user data
    const handleTokenExpiration = () => {
        localStorage.removeItem('user');
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
            window.location.href = '/admin-login';
        }, 3000);
    };

    // Clears success and error messages after a timeout
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 5001);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    // Sets up a user for editing
    const handleEdit = async (userId) => {
        const user = users.find(u => u._id === userId);
        setEditingUser(user);
    };

    // Saves edited user information to the backend
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/admin/user/edit/${editingUser._id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstname: editingUser.firstname,
                    lastname: editingUser.lastname,
                    email: editingUser.email
                })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('User updated successfully');
                // If there's a search query, use searchUsers instead of fetchUsers
                if (userSearchQuery.trim()) {
                    await searchUsers();
                } else {
                    await fetchUsers();
                }
                setEditingUser(null);
            } else {
                if (response.status === 403) {
                    handleTokenExpiration();
                } else {
                    setError(data.message);
                }
            }
        } catch (err) {
            setError('Failed to update user');
        }
    };
    
    // Deletes a user after confirmation
    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/admin/user/delete/${userId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (response.ok) {
                    setSuccess('User deleted successfully');
                    // If there's a search query, use searchUsers instead of fetchUsers
                    if (userSearchQuery.trim()) {
                        await searchUsers();
                    } else {
                        await fetchUsers();
                    }
                } else {
                    if (response.status === 403) {
                        handleTokenExpiration();
                    } else {
                        setError('Failed to delete user');
                    }
                }
            } catch (err) {
                setError('Failed to delete user');
            }
        }
    };

    // Sets up a listing for editing
    const handleEditListing = async (listingId) => {
        const listing = listings.find(l => l._id === listingId);
        setEditingListing(listing);
    };

    // Saves edited listing information to the backend
    const handleSaveListing = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/admin/listings/${editingListing._id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: editingListing.title,
                    brand: editingListing.brand,
                    image: editingListing.image,
                    stock: editingListing.stock,
                    price: editingListing.price,
                    disabled: editingListing.disabled
                })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('Listing updated successfully');
                fetchListings();
                setEditingListing(null);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to update listing');
        }
    };
    
    // Deletes a listing after confirmation
    const handleDeleteListing = async (listingId) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/admin/listings/${listingId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (response.ok) {
                    setSuccess('Listing deleted successfully');
                    fetchListings();
                } else {
                    setError('Failed to delete listing');
                }
            } catch (err) {
                setError('Failed to delete listing');
            }
        }
    };

    // Exports sales logs to a CSV file
    const exportSalesLogs = async () => {
        try {
            const response = await fetch(
                `http://localhost:${process.env.REACT_APP_API_PORT}/admin/logs/export`,
                {
                    credentials: 'include'
                }
            );
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sales_logs.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            }
        } catch (err) {
            console.error('Error exporting sales logs:', err);
        }
    };

    // Pagination controls component for navigating pages
    const PaginationControls = ({ isBottom }) => (
        <div className={`pagination ${isBottom ? 'bottom-pagination' : ''}`}>
            <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );

    // Renders the admin dashboard UI
    return (
        <div className="admin-root">
            <main className="admin-main">
                {/* Header with title and return button */}
                <div className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <button 
                        className="return-home-btn"
                        onClick={() => window.location.href = '/home'}
                    >
                        Return to Home
                    </button>
                </div>

                {/* Tab navigation */}
                <div className="tab-bar">
                    <div 
                        className={`tab${activeTab === 'userManagement' ? ' active' : ''}`} 
                        onClick={() => setActiveTab('userManagement')}
                    >
                        User Management
                    </div>
                    <div 
                        className={`tab${activeTab === 'listingManagement' ? ' active' : ''}`} 
                        onClick={() => setActiveTab('listingManagement')}
                    >
                        Listing Management
                    </div>
                    <div 
                        className={`tab${activeTab === 'reviewManagement' ? ' active' : ''}`} 
                        onClick={() => setActiveTab('reviewManagement')}
                    >
                        Review Management
                    </div>
                    <div 
                        className={`tab${activeTab === 'sales' ? ' active' : ''}`}
                        onClick={() => setActiveTab('sales')}
                    >
                        Sales Logs
                    </div>
                </div>

                {/* Tab content */}
                <div className="tab-content">
                    {/* User Management Tab */}
                    {activeTab === 'userManagement' && (
                        <div className="user-management">
                            {/* User search bar */}
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            searchUsers();
                                        }
                                    }}
                                />
                                <button onClick={searchUsers}>Search</button>
                            </div>

                            {/* Top pagination controls and items per page selector */}
                            <div className="pagination-controls">
                                <select 
                                    value={itemsPerPage} 
                                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                    className="items-per-page"
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="25">25 per page</option>
                                    <option value="50">50 per page</option>
                                </select>
                                <PaginationControls />
                            </div>

                            {/* Status messages */}
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}

                            {/* Users table */}
                            <div className="users-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleUserSort('name')}
                                                data-sort={userSortConfig.key === 'name' ? userSortConfig.direction : null}
                                            >
                                                Name
                                            </th>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleUserSort('email')}
                                                data-sort={userSortConfig.key === 'email' ? userSortConfig.direction : null}
                                            >
                                                Email
                                            </th>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleUserSort('registrationDate')}
                                                data-sort={userSortConfig.key === 'registrationDate' ? userSortConfig.direction : null}
                                            >
                                                Registration Date
                                            </th>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleUserSort('lastLogin')}
                                                data-sort={userSortConfig.key === 'lastLogin' ? userSortConfig.direction : null}
                                            >
                                                Last Login
                                            </th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getPaginatedData(users).map(user => (
                                            <tr key={user._id}>
                                                <td>{user.firstname} {user.lastname}</td>
                                                <td>{user.email}</td>
                                                <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                                                <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                                                <td>
                                                    <button onClick={() => handleEdit(user._id)}>Edit</button>
                                                    <button onClick={() => handleDelete(user._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Bottom pagination controls */}
                            <PaginationControls isBottom={true} />
                        </div>
                    )}

                    {/* Listing Management Tab */}
                    {activeTab === 'listingManagement' && (
                        <div className="listing-management">
                            {/* Listing search bar */}
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search listings..."
                                    value={listingSearchQuery}
                                    onChange={(e) => setListingSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            searchListings();
                                        }
                                    }}
                                />
                                <button onClick={searchListings}>Search</button>
                            </div>

                            {/* Top pagination controls and items per page selector */}
                            <div className="pagination-controls">
                                <select 
                                    value={itemsPerPage} 
                                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                    className="items-per-page"
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="25">25 per page</option>
                                    <option value="50">50 per page</option>
                                </select>
                                <PaginationControls />
                            </div>

                            {/* Status messages */}
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}

                            {/* Listings table */}
                            <div className="listings-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleListingSort('title')}
                                                data-sort={listingSortConfig.key === 'title' ? listingSortConfig.direction : null}
                                            >
                                                Title
                                            </th>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleListingSort('brand')}
                                                data-sort={listingSortConfig.key === 'brand' ? listingSortConfig.direction : null}
                                            >
                                                Brand
                                            </th>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleListingSort('price')}
                                                data-sort={listingSortConfig.key === 'price' ? listingSortConfig.direction : null}
                                            >
                                                Price ($)
                                            </th>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleListingSort('stock')}
                                                data-sort={listingSortConfig.key === 'stock' ? listingSortConfig.direction : null}
                                            >
                                                Stock
                                            </th>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleListingSort('disabled')}
                                                data-sort={listingSortConfig.key === 'disabled' ? listingSortConfig.direction : null}
                                            >
                                                Status
                                            </th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getPaginatedData(listings).map(listing => (
                                            <tr key={listing._id}>
                                                <td>{listing.title}</td>
                                                <td>{listing.brand}</td>
                                                <td>${listing.price}</td>
                                                <td>{listing.stock}</td>
                                                <td>{listing.disabled ? 'Disabled' : 'Active'}</td>
                                                <td>
                                                    <button onClick={() => handleEditListing(listing._id)}>Edit</button>
                                                    <button onClick={() => handleDeleteListing(listing._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Bottom pagination controls */}
                            <PaginationControls isBottom={true} />
                        </div>
                    )}

                    {/* Review Management Tab */}
                    {activeTab === 'reviewManagement' && (
                        <div className="review-management">
                            {/* Review search bar */}
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search reviews..."
                                    value={reviewSearchQuery}
                                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            searchReviews();
                                        }
                                    }}
                                />
                                <button onClick={searchReviews}>Search</button>
                            </div>

                            {/* Top pagination controls and items per page selector */}
                            <div className="pagination-controls">
                                <select 
                                    value={itemsPerPage} 
                                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                    className="items-per-page"
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="25">25 per page</option>
                                    <option value="50">50 per page</option>
                                </select>
                                <PaginationControls />
                            </div>

                            {/* Status messages */}
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}

                            {/* Reviews table */}
                            <div className="reviews-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleReviewSort('listingTitle')}
                                                data-sort={reviewSortConfig.key === 'listingTitle' ? reviewSortConfig.direction : null}
                                            >
                                                Listing
                                            </th>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleReviewSort('reviewer')}
                                                data-sort={reviewSortConfig.key === 'reviewer' ? reviewSortConfig.direction : null}
                                            >
                                                Reviewer
                                            </th>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleReviewSort('rating')}
                                                data-sort={reviewSortConfig.key === 'rating' ? reviewSortConfig.direction : null}
                                            >
                                                Rating
                                            </th>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleReviewSort('comment')}
                                                data-sort={reviewSortConfig.key === 'comment' ? reviewSortConfig.direction : null}
                                            >
                                                Comment
                                            </th>
                                            <th 
                                                className="sortable" 
                                                onClick={() => handleReviewSort('hidden')}
                                                data-sort={reviewSortConfig.key === 'hidden' ? reviewSortConfig.direction : null}
                                            >
                                                Status
                                            </th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getPaginatedData(reviews).map(review => (
                                            <tr key={review._id}>
                                                <td>{review.listingTitle}</td>
                                                <td>{review.reviewer}</td>
                                                <td>{review.rating}/5</td>
                                                <td>{review.comment}</td>
                                                <td>{review.hidden ? 'Hidden' : 'Visible'}</td>
                                                <td>
                                                    <button 
                                                        onClick={() => toggleReviewVisibility(review._id, review.hidden)}
                                                        className="toggle-review"
                                                    >
                                                        Toggle
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Bottom pagination controls */}
                            <PaginationControls isBottom={true} />
                        </div>
                    )}

                    {activeTab === 'sales' && (
                        <div className="admin-section">
                            <div className="section-header">
                                <h2>Sales Logs</h2>
                                <button onClick={exportSalesLogs} className="export-button">
                                    Export to CSV
                                </button>
                            </div>
                            {salesError && <div className="error-message">{salesError}</div>}
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>Buyer</th>
                                            <th>Items</th>
                                            <th>Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesLogs && salesLogs.length > 0 ? (
                                            salesLogs.map((log) => (
                                                <tr key={log._id}>
                                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td>
                                                        {log.user
                                                            ? `${log.user.firstname} ${log.user.lastname}`
                                                            : <span style={{color: 'red'}}>Unknown User</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        {log.items.map((item, index) => (
                                                            <div key={index}>
                                                                {item.listing
                                                                    ? `${item.listing.title} x ${item.quantity} ($${item.price})`
                                                                    : <span style={{color: 'red'}}>Unknown Listing x {item.quantity} (${item.price})</span>
                                                                }
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td>${log.total.toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center' }}>
                                                    {salesError ? 'Error loading sales logs' : 'No sales logs found'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit User Modal */}
                {editingUser && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Edit User</h2>
                            <form onSubmit={handleSave}>
                                <div className="form-group">
                                    <label>First Name:</label>
                                    <input
                                        type="text"
                                        value={editingUser.firstname}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            firstname: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name:</label>
                                    <input
                                        type="text"
                                        value={editingUser.lastname}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            lastname: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email:</label>
                                    <input
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            email: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="modal-buttons">
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Listing Modal */}
                {editingListing && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Edit Listing</h2>
                            <form onSubmit={handleSaveListing}>
                                <div className="form-group">
                                    <label>Title:</label>
                                    <input
                                        type="text"
                                        value={editingListing.title}
                                        onChange={(e) => setEditingListing({
                                            ...editingListing,
                                            title: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Brand:</label>
                                    <input
                                        type="text"
                                        value={editingListing.brand}
                                        onChange={(e) => setEditingListing({
                                            ...editingListing,
                                            brand: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price:</label>
                                    <input
                                        type="number"
                                        value={editingListing.price}
                                        onChange={(e) => setEditingListing({
                                            ...editingListing,
                                            price: parseFloat(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock:</label>
                                    <input
                                        type="number"
                                        value={editingListing.stock}
                                        onChange={(e) => setEditingListing({
                                            ...editingListing,
                                            stock: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status:</label>
                                    <select
                                        value={editingListing.disabled ? 'disabled' : 'active'}
                                        onChange={(e) => setEditingListing({
                                            ...editingListing,
                                            disabled: e.target.value === 'disabled'
                                        })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="disabled">Disabled</option>
                                    </select>
                                </div>
                                <div className="modal-buttons">
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setEditingListing(null)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminView;