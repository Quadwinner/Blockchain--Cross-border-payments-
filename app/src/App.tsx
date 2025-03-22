import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppContextProvider, useAppContext } from './context/AppContext';
import './App.css';
// Ensure TailwindCSS is imported if needed
import './styles/index.css';

// Components
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import SendMoney from './components/SendMoney';
import VerifyKYC from './components/VerifyKYC';
import AdminKYC from './components/AdminKYC';
import Profile from './components/Profile';
import TransactionHistory from './pages/TransactionHistory';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAppContext();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// App content with routes
const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header is rendered outside of the main element to ensure it's always visible */}
      <Header />
      <main className="pt-4">
        <Routes>
          <Route path="/" element={
            <Navigate to="/dashboard" />
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/send-money" element={
            <ProtectedRoute>
              <SendMoney />
            </ProtectedRoute>
          } />
          <Route path="/verify-kyc" element={
            <ProtectedRoute>
              <VerifyKYC />
            </ProtectedRoute>
          } />
          <Route path="/admin/kyc" element={
            <ProtectedRoute>
              <AdminKYC />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/transaction-history" element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <AppContextProvider>
        <AppContent />
      </AppContextProvider>
    </Router>
  );
}

export default App; 