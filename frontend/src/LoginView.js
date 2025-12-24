import React, { useState } from 'react';
import './LoginView.css';

// LoginView component handles user sign-in
function LoginView({ onLoginSuccess, onSignupClick, onResetPasswordClick, onBackToHome, previousView }) {
    // State for form fields and UI feedback
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Handle form submission for login
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic validation for email
        if (!email.includes('@')) {
            setErrorMessage('Please enter a valid email address');
            return;
        }
        // Clear previous errors and set loading
        setErrorMessage('');
        setIsLoading(true);
        try {
            // Send login request to backend
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/auth/login`, {
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
            // Call the success callback to update app state
            if (onLoginSuccess) {
                onLoginSuccess(data.user);
            }
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Render the login form and navigation links
    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
                <div className="login-links">
                    <button onClick={onSignupClick} className="link-button">
                        Don't have an account? Sign up
                    </button>
                    <button onClick={onResetPasswordClick} className="link-button">
                        Forgot Password?
                    </button>
                </div>
                <button onClick={() => onBackToHome('home')} className="back-button">
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default LoginView; 