import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// CORRECTED: Imports from the organized folders
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import ContractForm from './pages/ContractForm';
import ContractResult from './pages/ContractResult';
// --- CHANGE START ---
// 1. Import the new ContractView page
import ContractView from './pages/ContractView';
// --- CHANGE END ---
import DemoNotice from './components/DemoNotice';

// The AuthContext is created and exported here, making this the single source of truth.
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) { setUser(JSON.parse(userData)); }
    setLoading(false);
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

  if (loading) { return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>; }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <DemoNotice />
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/create-contract" element={user ? <ContractForm /> : <Navigate to="/login" />} />
            <Route 
              path="/contract-result" 
              element={user ? <ContractResult /> : <Navigate to="/login" />} 
            />
            {/* --- CHANGE START --- */}
            {/* 2. Register the new route for viewing a single contract */}
            <Route 
              path="/contracts/:id" 
              element={user ? <ContractView /> : <Navigate to="/login" />} 
            />
            {/* --- CHANGE END --- */}
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
export default App;