document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const submitButton = document.getElementById('submitButton');
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Basic validation
        if (!auth.validateEmail(email)) {
            auth.showError('errorMessage', 'Please enter a valid email address');
            return;
        }

        if (password !== confirmPassword) {
            auth.showError('errorMessage', 'Passwords do not match');
            return;
        }

        // Clear previous errors
        auth.hideError('errorMessage');

        // Set loading state
        auth.setLoading('signupForm', true);

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            // Show success message
            auth.showSuccess('signupForm', 'Signup successful! Please check your email to verify your account.');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);

        } catch (error) {
            auth.showError('errorMessage', error.message);
        } finally {
            auth.setLoading('signupForm', false);
        }
    });
}); 