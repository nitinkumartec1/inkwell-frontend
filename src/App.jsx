import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Loader from './components/Loader';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Write = lazy(() => import('./pages/Write'));
const StoryDetail = lazy(() => import('./pages/StoryDetail'));
const Saved = lazy(() => import('./pages/Saved'));
const Profile = lazy(() => import('./pages/Profile'));
const MyStories = lazy(() => import('./pages/MyStories'));
const Reach = lazy(() => import('./pages/Reach'));
const Following = lazy(() => import('./pages/Following'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

import './index.css';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                boxShadow: 'var(--shadow-lg)',
              },
            }}
          />

          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Pages with layout */}
                <Route
                  path="/"
                  element={
                    <AppLayout>
                      <Home />
                    </AppLayout>
                  }
                />
                <Route
                  path="/story/:id"
                  element={
                    <AppLayout>
                      <StoryDetail />
                    </AppLayout>
                  }
                />
                <Route
                  path="/user/:username"
                  element={
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/write"
                  element={
                    <AppLayout>
                      <ProtectedRoute>
                        <Write />
                      </ProtectedRoute>
                    </AppLayout>
                  }
                />
                <Route
                  path="/saved"
                  element={
                    <AppLayout>
                      <ProtectedRoute>
                        <Saved />
                      </ProtectedRoute>
                    </AppLayout>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <AppLayout>
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    </AppLayout>
                  }
                />
                <Route
                  path="/stories/:status"
                  element={
                    <AppLayout>
                      <ProtectedRoute>
                        <MyStories />
                      </ProtectedRoute>
                    </AppLayout>
                  }
                />
                <Route
                  path="/reach"
                  element={
                    <AppLayout>
                      <ProtectedRoute>
                        <Reach />
                      </ProtectedRoute>
                    </AppLayout>
                  }
                />
                <Route
                  path="/following"
                  element={
                    <AppLayout>
                      <ProtectedRoute>
                        <Following />
                      </ProtectedRoute>
                    </AppLayout>
                  }
                />

                {/* 404 Route */}
                <Route
                  path="*"
                  element={
                    <AppLayout>
                      <NotFound />
                    </AppLayout>
                  }
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
