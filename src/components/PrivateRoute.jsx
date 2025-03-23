import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * A wrapper for routes that should only be accessible to authenticated users
 * Redirects to homepage if user is not authenticated
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking authentication status
  if (loading) {
    return <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  // Redirect to homepage if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }

  // Render the component if authenticated
  return children;
};

export default PrivateRoute; 