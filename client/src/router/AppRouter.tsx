import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LandingPage from '@/pages/landing/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AppShell from '@/components/layout/AppShell'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import KanbanPage from '@/pages/tasks/KanbanPage'
import MeetingPage from '@/pages/meeting/MeetingPage'
import MeetingRoom from '@/pages/meeting/MeetingRoom'
import AuthCallbackPage from '@/pages/auth/AuthCallbackPage'
import PreJoin from '@/pages/meeting/PreJoin'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        {/* Full screen meeting room - outside AppShell */}
        <Route path="/meeting-room/:meetingCode" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />

        {/* Protected routes with AppShell layout */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/tasks" element={<KanbanPage />} />
          <Route path="/meetings" element={<MeetingPage />} />
          <Route path="/pre-join/:meetingCode" element={<ProtectedRoute><PreJoin /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter