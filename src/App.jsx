import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PlaygroundPage from './pages/PlaygroundPage';
import ProjectsPage from './pages/ProjectsPage';
import WorkspacePage from './pages/WorkspacePage';
import ExplorePage from './pages/ExplorePage';
import CollaborationPage from './pages/CollaborationPage';
import AppLayout from './components/layout/AppLayout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div><p>Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout><HomePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/playground" element={
        <ProtectedRoute>
          <AppLayout><PlaygroundPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/projects" element={
        <ProtectedRoute>
          <AppLayout><ProjectsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/workspace/:id" element={
        <ProtectedRoute>
          <WorkspacePage />
        </ProtectedRoute>
      } />
      <Route path="/explore" element={
        <ProtectedRoute>
          <AppLayout><ExplorePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/collaborate" element={
        <ProtectedRoute>
          <AppLayout><CollaborationPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <WorkspaceProvider>
            <AppRoutes />
          </WorkspaceProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
