/* eslint-disable */
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user on load
    const savedUser = localStorage.getItem('fairdigest_user');
    const token = localStorage.getItem('fairdigest_token');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('fairdigest_user');
        localStorage.removeItem('fairdigest_token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fairdigest_user');
    localStorage.removeItem('fairdigest_token');
    setUser(null);
  };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} 
        />
      </Routes>
    </Router>
  );
}
