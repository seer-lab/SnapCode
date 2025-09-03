import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/authContext';
import Spinner from '../Spinner/Spinner';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isAuthContextLoading } = useAuthContext();
  
  // Show spinner while checking authentication
  if (isAuthContextLoading) {
    return <Spinner />;
  }
  
  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  // If logged in, render the protected component
  return children;
};

export default ProtectedRoute;