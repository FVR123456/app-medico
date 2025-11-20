import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CompleteProfile = lazy(() => import('./pages/patient/CompleteProfile'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const BookAppointment = lazy(() => import('./pages/patient/BookAppointment'));
const MedicalHistory = lazy(() => import('./pages/patient/MedicalHistory'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const AppointmentManager = lazy(() => import('./pages/doctor/AppointmentManager'));
const PatientDetails = lazy(() => import('./pages/doctor/PatientDetails'));
const ConsultationForm = lazy(() => import('./pages/doctor/ConsultationForm'));

// Loading fallback component
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <CompleteProfile />
            </ProtectedRoute>
          } />

          {/* Patient Routes */}
          <Route path="/patient-dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/book-appointment" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <BookAppointment />
            </ProtectedRoute>
          } />
          <Route path="/medical-history" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MedicalHistory />
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor-dashboard" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <AppointmentManager />
            </ProtectedRoute>
          } />
          <Route path="/patient-details/:id" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PatientDetails />
            </ProtectedRoute>
          } />
          <Route path="/consultation/:patientId" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <ConsultationForm />
            </ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

const RootRedirect = () => {
  const { user, role, loading } = useAuth();

  if (loading) return null; // ProtectedRoute will show spinner

  if (user && role) {
    return <Navigate to={role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} replace />;
  }

  return <Navigate to="/login" replace />;
};

export default App;
