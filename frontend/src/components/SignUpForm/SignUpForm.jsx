import React, { useState } from 'react';
import './SignUpForm.css';
import { Link, useNavigate } from 'react-router-dom';
import redErrorIcon from "../../assets/red-error.png";
import { useAuthContext } from '../../contexts/authContext';
import SolidButton from '../buttons/Solid/SolidButton';
import { FiUserPlus } from 'react-icons/fi';

function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    // Client-side validation
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await signup(email, password);
      // Navigation will be handled automatically by AuthContext
      navigate("/dashboard");
    } catch (error) {
      console.log("Signup error:", error);
      
      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        setError("This email already has an account. Try logging in.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError("Sign up failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="signup-header">
          <FiUserPlus size={48} color="#4C4BFF" />
          <h2>Create Account</h2>
          <p>Join and start Snaping!</p>
        </div>
        
        {error && 
          <div className='error-row'>
            <img src={redErrorIcon} alt="Error" />
            <div className="error-message">{error}</div>
          </div>
        }
        
        <div className="input-group">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="input-group">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <SolidButton type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </SolidButton>
      </form>
    </div>
  );
}

export default SignUpForm;