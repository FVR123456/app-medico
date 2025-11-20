import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('doctor' | 'patient')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, profileCompleted, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect based on role if they try to access unauthorized page
    return <Navigate to={role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} />;
  }

  // Redirect patients with incomplete profile to complete-profile page
  // (except if they're already on that page)
  if (role === 'patient' && !profileCompleted && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
