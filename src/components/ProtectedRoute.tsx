import React from 'react';
import { Navigate } from 'react-router-dom';
import { isFeatureEnabled } from '../config/features';

interface ProtectedRouteProps {
  children: React.ReactNode;
  feature: string;
  user?: any;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  feature, 
  user, 
  requireAuth = false 
}) => {
  const isAdmin = user && user.isAdmin;
  const isLoggedIn = !!user;
  
  // Admin can access all features
  if (isAdmin) {
    return <>{children}</>;
  }
  
  // Check if feature is enabled for regular users
  if (!isFeatureEnabled(feature as any)) {
    return <Navigate to="/" replace />;
  }
  
  // Check authentication requirement
  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;

