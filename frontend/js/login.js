document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const submitButton = document.getElementById('submitButton');
    
    // Store original button text
    submitButton.setAttribute('data-original-text', submitButton.textContent);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Basic validation
        if (!auth.validateEmail(email)) {
            auth.showError('errorMessage', 'Please enter a valid email address');
            return;
        }

        // Clear previous errors
        auth.hideError('errorMessage');

        // Set loading state
        auth.setLoading('loginForm', true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                }),
                credentials: 'include' // Important for receiving cookies
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store user info in localStorage (excluding sensitive data)
            localStorage.setItem('user', JSON.stringify({
                id: data.user.id,
                firstname: data.user.firstname,
                lastname: data.user.lastname
            }));

            // Redirect to home page
            window.location.href = 'home.html';

        } catch (error) {
            auth.showError('errorMessage', error.message);
        } finally {
            auth.setLoading('loginForm', false);
        }
    });
}); 