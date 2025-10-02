import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail 
} from '../config/firebase';
import { setCurrentUserId, clearAllExercises } from '../utils/exerciseStorage';

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

const login = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await result.user.getIdToken(); 
  setCurrentUserId(result.user.uid);

  // We now create a session in our backend
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to create backend session');
  }

  const data = await response.json();

  // Save user info including readableId
  setCurrentUser(data.user);

  return result;
};



const signup = async (email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await result.user.getIdToken();
  setCurrentUserId(result.user.uid);

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to create backend session');
  }

  const data = await response.json();
  setCurrentUser(data.user);

  return result;
};


  const logout = async () => {
    // Clear user ID (but don't delete data)
    setCurrentUserId(null);
    setCurrentUser(null);
    
    // Clear backend session first
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    // Then sign out from Firebase
    return signOut(auth);
  };

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
      // 🔸 Incluye readableId automáticamente
      setCurrentUser(data.user);

      if (data.user?.uid) {
        setCurrentUserId(data.user.uid);
      }
    } else {
      setCurrentUser(null);
      setCurrentUserId(null);
      clearAllExercises();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    setCurrentUser(null);
    setCurrentUserId(null);
    clearAllExercises();
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    isAuthContextLoading: loading,
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