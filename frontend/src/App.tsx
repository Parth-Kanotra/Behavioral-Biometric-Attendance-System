import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { EnrollmentPage } from './pages/EnrollmentPage';
import { AttendancePage } from './pages/AttendancePage';
import { FacultyDashboard } from './pages/FacultyDashboard';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  facultyOnly?: boolean
}> = ({ children, facultyOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (facultyOnly && user.role !== 'faculty') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const [checkingEnrollment, setCheckingEnrollment] = React.useState(true);
  const [isEnrolled, setIsEnrolled] = React.useState(false);

  React.useEffect(() => {
    const checkEnrollment = async () => {
      if (user && user.role === 'student') {
        const { db } = await import('@/config/firebase');
        const { doc, getDoc } = await import('firebase/firestore');

        const profileDoc = await getDoc(doc(db, 'behavioral_profiles', user.uid));
        setIsEnrolled(profileDoc.exists());
      }
      setCheckingEnrollment(false);
    };

    if (user) {
      checkEnrollment();
    }
  }, [user]);

  if (loading || checkingEnrollment) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'faculty') {
    return <Navigate to="/faculty" replace />;
  } else {
    // Student - check if enrolled
    return <Navigate to={isEnrolled ? "/attendance" : "/enroll"} replace />;
  }
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard - Redirects based on role */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* Student Routes */}
          <Route
            path="/enroll"
            element={
              <ProtectedRoute>
                <EnrollmentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            }
          />

          {/* Faculty Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute facultyOnly>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
