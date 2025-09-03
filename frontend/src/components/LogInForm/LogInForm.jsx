import React, { useState } from 'react';
import './LogInForm.css'; 
import { Link, useNavigate } from 'react-router-dom';
import redErrorIcon from "../../assets/red-error.png";
import { useAuthContext } from '../../contexts/authContext';
import SolidButton from '../buttons/Solid/SolidButton';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function LogInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      // Navigation will be handled automatically by AuthContext
      navigate("/dashboard");
    } catch (error) {
      console.log("Login error:", error);
      
      // Handle specific Firebase errors
      if (error.code === "auth/user-not-found" || 
          error.code === "auth/wrong-password" || 
          error.code === "auth/invalid-credential") {
        setError("Invalid credentials.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (error.code === "auth/user-disabled") {
        setError("Account disabled. Please contact support.");
      } else {
        setError("Invalid credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
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
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="password-input"
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={togglePasswordVisibility}
            disabled={isLoading}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>
      </div>
      
      <SolidButton type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Log in"}
      </SolidButton>
     
      <p>
        Don't have an account? <Link to="/signup" className="link">Sign Up</Link>
      </p>
    </form>
  );
}

export default LogInForm;