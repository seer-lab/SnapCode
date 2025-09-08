// Ejemplo de cómo actualizar tu AuthContext para incluir password reset
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail 
} from '../config/firebase';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Existing methods...
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Send UID to backend for session creation
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ uid: result.user.uid }),
    });

    if (!response.ok) {
      throw new Error('Failed to create backend session');
    }

    return result;
  };

  const signup = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Automatically create backend session after signup
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ uid: result.user.uid }),
    });

    if (!response.ok) {
      throw new Error('Failed to create backend session');
    }

    return result;
  };

  const logout = async () => {
    // Clear backend session first
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    // Then sign out from Firebase
    return signOut(auth);
  };

  // New method for password reset
  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    });
  };

  // Check authentication status on app load
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/authenticate', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    currentUser,
    isLoggedIn: !!currentUser, // ← LÍNEA AGREGADA: convierte currentUser a boolean
    isAuthContextLoading: loading, // ← LÍNEA CAMBIADA: renombrado de loading
    login,
    signup,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};