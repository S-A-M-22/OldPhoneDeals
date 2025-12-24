document.addEventListener('DOMContentLoaded', () => {
    const resetForm = document.getElementById('resetForm');
    const submitButton = document.getElementById('submitButton');
    
    // Store original button text
    submitButton.setAttribute('data-original-text', submitButton.textContent);

    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById('email').value;

        // Validate email
        if (!auth.validateEmail(email)) {
            auth.showError('errorMessage', 'Please enter a valid email address');
            return;
        }

        // Clear previous messages
        auth.hideError('errorMessage');

        // Set loading state
        auth.setLoading('resetForm', true);

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                auth.showSuccess('successMessage', data.message || 'Reset link sent! Please check your email.');
                // Disable the form after successful submission
                resetForm.reset();
                submitButton.disabled = true;
            } else {
                auth.showError('errorMessage', data.message || 'Failed to send reset email');
            }
        } catch (error) {
            auth.showError('errorMessage', 'An error occurred. Please try again.');
        } finally {
            auth.setLoading('resetForm', false);
        }
    });
}); 