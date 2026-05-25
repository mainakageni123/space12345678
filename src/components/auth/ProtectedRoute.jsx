import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const ProtectedRoute = ({ children }) => {
  const { admin, loading, verifyToken } = useAdminAuth();
  const location = useLocation();

  useEffect(() => {
    // Re-verify only on pathname change; verifyToken is stable (useCallback)
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      verifyToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cosmic-depth"></div>
      </div>
    );
  }

  if (!admin) {
    // Save the attempted URL for redirect after login (session-scoped)
    try { sessionStorage.setItem('redirectAfterLogin', location.pathname); } catch (e) {}
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default ProtectedRoute;
