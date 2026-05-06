import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { usePermissions } from './hooks/usePermissions';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { AssetsList } from './pages/AssetsList';
import { AssetDetail } from './pages/AssetDetail';
import { Maintenance } from './pages/Maintenance';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { ActivityLog } from './pages/ActivityLog';
import { NotFound } from './pages/NotFound';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiresPermission?: string }> = ({ children, requiresPermission }) => {
  const { currentUser } = useApp();
  const { canAccessRoute } = usePermissions();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiresPermission && !canAccessRoute(requiresPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/assets" element={<AssetsList />} />
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<ProtectedRoute requiresPermission="/users"><Users /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute requiresPermission="/activity"><ActivityLog /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;