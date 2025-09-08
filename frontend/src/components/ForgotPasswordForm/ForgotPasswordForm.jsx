import React, { useState } from 'react';
import './ForgotPasswordForm.css';
import { Link } from 'react-router-dom';
import redErrorIcon from "../../assets/red-error.png";
import { sendPasswordResetEmail, auth } from '../../config/firebase'
import SolidButton from '../buttons/Solid/SolidButton';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email, {
        // Customize the email action URL if needed
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      
      setSuccess('Password reset email sent! Please check your inbox and spam folder.');
      setEmail(''); // Clear the form
    } catch (error) {
      console.log("Password reset error:", error);
      
      // Handle specific Firebase errors
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-form-container">
      <div className="forgot-password-header">
        <FiMail size={48} color="#4C4BFF" />
        <h2>Reset Your Password</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="forgot-password-form">
        {error && 
          <div className='error-row'>
            <img src={redErrorIcon} alt="Error" />
            <div className="error-message">{error}</div>
          </div>
        }

        {success && 
          <div className='success-row'>
            <FiMail size={20} color="#28a745" />
            <div className="success-message">{success}</div>
          </div>
        }
        
        <div className="input-group">
          <input
            type="email"
            style={{ width: '100%' }}
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <SolidButton type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Email"}
        </SolidButton>


      </form>
    </div>
  );
}

export default ForgotPasswordForm;