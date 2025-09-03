import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthContextLoading, setIsAuthContextLoading] = useState(true);
  const [currentExercise, setCurrentExercise] = useState(0);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthContextLoading(true);
      
      if (firebaseUser) {
        
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uid: firebaseUser.uid }),
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            setIsLoggedIn(true);
            setUser(data.user || firebaseUser);
            
          } else {
            // Backend sync failed, sign out from Firebase
            console.log("Backend sync failed, signing out");
            await signOut(auth);
          }
        } catch (error) {
          console.error("Backend sync error:", error);
          await signOut(auth);
        }
      } else {
        // No Firebase user, clean everything up
        setIsLoggedIn(false);
        setUser(null);
        setCurrentExercise(0);
        
        // Clean backend session
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          console.log("Backend logout error (non-critical):", error);
        }
      }
      
      setIsAuthContextLoading(false);
    });

    return unsubscribe;
  }, []);

  // Check existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      // Only check if we don't have a Firebase user yet
      if (!auth.currentUser) {
        try {
          const response = await fetch("/api/auth/authenticate", {
            method: "POST",
            credentials: "include",
          });

          if (response.ok) {
            // Backend says we're authenticated, but Firebase doesn't know
            // This means the session is stale, clean it up
            await fetch("/api/auth/logout", {
              method: "POST", 
              credentials: "include",
            });
          }
        } catch (error) {
          console.log("Session check error:", error);
        }
      }
    };

    checkExistingSession();
  }, []);

  const login = async (email, password) => {
    const { signInWithEmailAndPassword } = await import("../config/firebase");
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    const { createUserWithEmailAndPassword } = await import("../config/firebase");
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force cleanup
      setIsLoggedIn(false);
      setUser(null);
      setCurrentExercise(0);
      navigate("/login");
    }
  };

  const value = {
    isLoggedIn,
    user,
    isAuthContextLoading,
    currentExercise,
    login,
    signup,
    logout,
    setCurrentExercise,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};