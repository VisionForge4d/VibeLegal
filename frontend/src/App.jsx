import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import ContractForm from './components/ContractForm';
import ContractResult from './components/ContractResult';
import ContractViewer from './components/ContractViewer';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Pricing from './components/Pricing';
import About from './components/About';
import Contact from './components/Contact';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import Disclaimers from './components/Disclaimers';
import Beta from './components/Beta';
import FAQ from './components/FAQ';
import { FeedbackButton } from './components/FeedbackButton';
import Footer from './components/Footer';
import { ToastProvider } from './components/Toast';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserList } from './components/admin/UserList';
import { UserDetail } from './components/admin/UserDetail';

// Context for authentication
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start and validate token
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Validate token by making a simple API call that doesn't require subscription table
          const response = await fetch('/api/user-contracts', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            // Token is valid, set user
            setUser(JSON.parse(userData));
          } else {
            // Token is invalid/expired, clear auth data
            console.log('Token expired, clearing auth data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          // Network error or token validation failed
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    validateToken();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Global function to handle authentication errors
  const handleAuthError = () => {
    console.log('Authentication error detected, logging out');
    logout();
  };;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <AuthContext.Provider value={{ user, login, logout, handleAuthError }}>
        <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Admin Routes - No Navbar/Footer */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/:userId" element={<UserDetail />} />
            </Route>

            {/* Public Routes with Navbar/Footer */}
            <Route path="*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
                  <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/disclaimers" element={<Disclaimers />} />
                  <Route path="/beta" element={<Beta />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route
                    path="/dashboard"
                    element={user ? <Dashboard /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/create-contract"
                    element={user ? <ContractForm /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/settings"
                    element={user ? <Settings /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/contract-result"
                    element={user ? <ContractResult /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/contracts/:id"
                    element={user ? <ContractViewer /> : <Navigate to="/login" />}
                  />
                </Routes>
                <Footer />
                <FeedbackButton />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
    </ToastProvider>
  );
}

export default App;
