import React, { useState } from 'react';
import './LoginView.css'; // We can reuse the same styles

// SignupView component for user registration and account creation
function SignupView({ onSignupSuccess, onLoginClick, onBackToHome }) {
    // State for form fields, UI feedback, and loading
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Handles input changes for the signup form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handles form submission for signup
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.email.includes('@')) {
            setErrorMessage('Please enter a valid email address');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        // Clear previous errors
        setErrorMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            // Show success message
            setSuccessMessage('Signup successful! Please check your email to verify your account.');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                if (onSignupSuccess) {
                    onSignupSuccess();
                }
            }, 3000);

        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Renders the signup form and navigation links
    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Create Account</h2>
                
                {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                )}
                {successMessage && (
                    <div className="success-message">{successMessage}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="firstname">First Name</label>
                        <input 
                            type="text" 
                            id="firstname" 
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastname">Last Name</label>
                        <input 
                            type="text" 
                            id="lastname" 
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="login-links">
                        <button 
                            type="button" 
                            className="link-button" 
                            onClick={onLoginClick}
                        >
                            Already have an account? Sign In
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

export default SignupView; 