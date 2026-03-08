import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import GoalDetailsPage from './pages/GoalDetailsPage';
import MainLayout from './components/layout/MainLayout';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import { SettingsProvider } from './context/SettingsContext';

// Configuración de React Query para caché global
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de caché "fresca"
      gcTime: 1000 * 60 * 30,    // 30 minutos en recolector de basura
      refetchOnWindowFocus: false, // Evita recargas molestas al cambiar de pestaña
      retry: 1,
    },
  },
});

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0051FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <Router>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Rutas Privadas con Layout Persistente */}
            <Route element={user ? <MainLayout /> : <Navigate to="/login" />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/goals/:id" element={<GoalDetailsPage />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </Router>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
