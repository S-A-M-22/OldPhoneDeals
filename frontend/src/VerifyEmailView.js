import React, { useEffect, useState, useRef } from 'react';
import './LoginView.css'; // Reusing the same styles

/**
 * VerifyEmailView Component
 * 
 * This component handles the email verification process after a user signs up.
 * It extracts the verification token from the URL and sends it to the backend
 * to verify the user's email address.
 * 
 * Props:
 * @param {Function} onVerificationComplete - Callback function to handle successful verification
 */
function VerifyEmailView({ onVerificationComplete }) {
    // State to manage verification status and messages
    const [verificationStatus, setVerificationStatus] = useState({
        message: '',
        type: 'error' // 'error' or 'success'
    });
    
    // Loading state to show verification progress
    const [isLoading, setIsLoading] = useState(true);
    
    // Ref to prevent multiple verification attempts
    const hasAttemptedVerification = useRef(false);

    // Handles the email verification process on mount
    useEffect(() => {
        // Skip if verification has already been attempted
        if (hasAttemptedVerification.current) {
            return;
        }

        /**
         * verifyEmail Function
         * 
         * Handles the email verification process:
         * 1. Extracts token from URL
         * 2. Sends token to backend
         * 3. Updates UI based on response
         * 4. Redirects to login on success
         */
        const verifyEmail = async () => {
            // Extract token from URL query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            // Handle missing token
            if (!token) {
                setVerificationStatus({
                    message: 'Invalid verification link. Please request a new one.',
                    type: 'error'
                });
                setIsLoading(false);
                return;
            }

            try {
                // Send verification request to backend
                const response = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/auth/verify-email?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    // Handle successful verification
                    setVerificationStatus({
                        message: data.message || 'Email verified successfully!',
                        type: 'success'
                    });
                    // Redirect to login after 2 seconds
                    setTimeout(() => {
                        onVerificationComplete && onVerificationComplete();
                    }, 2000);
                } else {
                    throw new Error(data.message || 'Verification failed');
                }
            } catch (error) {
                // Handle verification errors
                setVerificationStatus({
                    message: error.message,
                    type: 'error'
                });
            } finally {
                setIsLoading(false);
            }
        };

        // Mark verification as attempted and start the process
        hasAttemptedVerification.current = true;
        verifyEmail();
    }, [onVerificationComplete]);

    /**
     * handleReturnToLogin
     * 
     * Manually triggers the return to login page
     */
    const handleReturnToLogin = () => {
        onVerificationComplete && onVerificationComplete();
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Email Verification</h2>
                
                {/* Show loading state or verification result */}
                {isLoading ? (
                    <div className="loading-message">Verifying your email...</div>
                ) : (
                    <div className={`${verificationStatus.type}-message`}>
                        {verificationStatus.message}
                    </div>
                )}

                {/* Return to login button */}
                <div className="auth-links">
                    <button 
                        type="button" 
                        className="link-button" 
                        onClick={handleReturnToLogin}
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmailView; 