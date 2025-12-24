import React, { useState } from 'react';
import './LoginView.css'; // Reusing the same styles

// ResetPasswordView handles requesting a password reset link via email
function ResetPasswordView({ onBackToLogin, onBackToHome }) {
    // State for email input, UI feedback, and loading
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Validate email format
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Handle form submission to request reset link
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate email
        if (!validateEmail(email)) {
            setErrorMessage('Please enter a valid email address');
            return;
        }
        // Clear previous messages and set loading
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            // Send reset password request to backend
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage(data.message || 'Reset link sent! Please check your email.');
                // Clear the email field after successful submission
                setEmail('');
            } else {
                setErrorMessage(data.message || 'Failed to send reset email');
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Render the reset password form and navigation links
    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Reset Password</h2>
                {/* Show error or success messages */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                
                <form onSubmit={handleSubmit}>
                    {/* Email input */}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your registered email"
                            required
                        />
                    </div>
                    {/* Submit button */}
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    {/* Navigation links */}
                    <div className="login-links">
                        <button 
                            type="button" 
                            className="link-button" 
                            onClick={onBackToLogin}
                        >
                            Back to Sign In
                        </button>
                        <button 
                            type="button" 
                            className="link-button" 
                            onClick={() => onBackToHome('home')}
                        >
                            Back to Home
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPasswordView; 