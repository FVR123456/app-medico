import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('doctor' | 'patient')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

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

  return <>{children}</>;
};

export default ProtectedRoute;
