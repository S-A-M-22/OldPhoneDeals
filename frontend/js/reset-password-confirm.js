document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const submitButton = document.getElementById('submitButton');
    
    // Store original button text
    submitButton.setAttribute('data-original-text', submitButton.textContent);

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Check if token exists
    if (!token) {
        auth.showError('errorMessage', 'Invalid reset link. Please request a new one.');
        submitButton.disabled = true;
        return;
    }

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            auth.showError('errorMessage', 'Passwords do not match');
            return;
        }

        // Clear previous messages
        auth.hideError('errorMessage');

        // Set loading state
        auth.setLoading('resetPasswordForm', true);

        try {
            const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    newPassword,
                    oldPassword: '' // Backend expects this but doesn't use it
                })
            });

            const data = await response.json();

            if (response.ok) {
                auth.showSuccess('successMessage', data.message || 'Password reset successful!');
                // Disable form after successful reset
                resetPasswordForm.reset();
                submitButton.disabled = true;
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                auth.showError('errorMessage', data.message || 'Failed to reset password');
            }
        } catch (error) {
            auth.showError('errorMessage', 'An error occurred. Please try again.');
        } finally {
            auth.setLoading('resetPasswordForm', false);
        }
    });
}); 