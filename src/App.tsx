import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import { AppLayout } from './components/layout/AppLayout';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Workouts } from './pages/Workouts';
import { WorkoutActive } from './pages/WorkoutActive';
import { Progress } from './pages/Progress';
import { Avatar } from './pages/Avatar';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

// A simple routing guard to redirect to onboarding if no profile exists
const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isOnboarded = useUserStore((state) => state.isOnboarded);
  return isOnboarded ? <>{children}</> : <Navigate to="/onboarding" replace />;
};

export const App: React.FC = () => {
  const { theme } = useUserStore();

  // Sync theme class on load
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          {/* Public / Onboarding */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <RouteGuard>
                <Home />
              </RouteGuard>
            }
          />
          <Route
            path="/workouts"
            element={
              <RouteGuard>
                <Workouts />
              </RouteGuard>
            }
          />
          <Route
            path="/workout-active/:type"
            element={
              <RouteGuard>
                <WorkoutActive />
              </RouteGuard>
            }
          />
          <Route
            path="/progress"
            element={
              <RouteGuard>
                <Progress />
              </RouteGuard>
            }
          />
          <Route
            path="/avatar"
            element={
              <RouteGuard>
                <Avatar />
              </RouteGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <RouteGuard>
                <Profile />
              </RouteGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <RouteGuard>
                <Settings />
              </RouteGuard>
            }
          />

          {/* Fallback Redirections */}
          <Route
            path="/"
            element={
              useUserStore.getState().isOnboarded ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
};

export default App;
