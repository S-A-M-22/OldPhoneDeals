document.addEventListener('DOMContentLoaded', async () => {
    const verificationStatus = document.getElementById('verificationStatus');
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        verificationStatus.textContent = 'Invalid verification link. Please request a new one.';
        verificationStatus.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/verify-email?token=${token}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            verificationStatus.textContent = data.message || 'Email verified successfully!';
            verificationStatus.className = 'success-message';
        } else {
            throw new Error(data.message || 'Verification failed');
        }
        verificationStatus.style.display = 'block';
    } catch (error) {
        verificationStatus.textContent = error.message;
        verificationStatus.className = 'error-message';
        verificationStatus.style.display = 'block';
    }
}); 