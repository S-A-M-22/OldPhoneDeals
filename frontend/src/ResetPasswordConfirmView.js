import React, { useState, useEffect } from 'react';
import './LoginView.css'; // Reusing the same styles

// ResetPasswordConfirmView handles setting a new password after clicking a reset link
function ResetPasswordConfirmView({ onBackToLogin, onBackToHome }) {
    // State for new password, confirm password, UI feedback, and token
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState(null);

    // Extract the token from the URL query parameters on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (!token) {
            setErrorMessage('Invalid reset link. Please request a new one.');
            return;
        }
        setToken(token);
    }, []);

    // Handle form submission to reset password
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            // Send reset password request
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    newpassword: newPassword,
                    oldpassword: '' // Backend expects this but doesn't use it
                })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage(data.message || 'Password reset successful!');
                setNewPassword('');
                setConfirmPassword('');
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    onBackToLogin();
                }, 2000);
            } else {
                setErrorMessage(data.message || 'Failed to reset password');
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Render the reset password confirmation form and navigation links
    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Set New Password</h2>
                {/* Show error or success messages */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                {/* New password input */}
                <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input 
                        type="password" 
                        id="newPassword" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                    />
                </div>
                {/* Confirm password input */}
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                    />
                </div>
                {/* Submit button */}
                <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isLoading || !token}
                >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                {/* Navigation links */}
                <div className="auth-links">
                    <button 
                        type="button" 
                        className="link-button" 
                        onClick={onBackToLogin}
                    >
                        Back to Sign In
                    </button>
                </div>
                <div className="auth-links">
                    <button type="button" className="link-button" onClick={onBackToHome}>Back to Home</button>
                </div>
            </form>
        </div>
    );
}

export default ResetPasswordConfirmView; 