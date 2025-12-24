// API URL
const API_URL = `http://localhost:${process.env.REACT_APP_API_PORT}/auth`;

// Utility functions for authentication
const auth = {
    // Validate email format
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Show error message
    showError: (elementId, message) => {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    },

    // Show success message
    showSuccess: (elementId, message) => {
        const successElement = document.getElementById(elementId);
        successElement.textContent = message;
        successElement.style.display = 'block';
    },

    // Hide error message
    hideError: (elementId) => {
        const errorElement = document.getElementById(elementId);
        errorElement.style.display = 'none';
    },

    // Set loading state
    setLoading: (formId, isLoading) => {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (isLoading) {
            form.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Please wait...';
        } else {
            form.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
        }
    },

    // Store user data
    storeUser: (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
    },

    // Get stored user data
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Remove stored user data
    clearUser: () => {
        localStorage.removeItem('user');
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return !!auth.getUser();
    },

    // Redirect to login if not authenticated
    requireAuth: () => {
        if (!auth.isLoggedIn()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    // Logout user
    logout: () => {
        if (confirm('Are you sure you want to log out?')) {
            auth.clearUser();
            window.location.href = '/login.html';
        }
    }
}; 