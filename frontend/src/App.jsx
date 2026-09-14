import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { clearTokens, getTokens } from "./api";
import Login from "./pages/Login";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Projects from "./pages/Projects";
import Rentals from "./pages/Rentals";
import Saved from "./pages/Saved";
import Insights from "./pages/Insights";
import './App.css';

function Navbar({ onLogout }) {
  return (
    <nav style={{ padding: "10px", background: "#f0f0f0", display: "flex", gap: "15px", alignItems: "center" }}>
      <b style={{ marginRight: "auto" }}>Ivy Homes</b>
      <Link to="/listings">Listings</Link>
      <Link to="/rentals">Rentals</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/saved">Saved</Link>
      <Link to="/insights">Insights</Link>
      <button onClick={onLogout} style={{ marginLeft: "15px" }}>Logout</button>
    </nav>
  );
}

function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getTokens().access);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar onLogout={handleLogout} />}
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/listings" /> : <Login onLogin={handleLogin} />} />
          <Route path="/listings" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Listings /></ProtectedRoute>} />
          <Route path="/listings/:id" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ListingDetail /></ProtectedRoute>} />
          <Route path="/rentals" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Rentals /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Projects /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Saved /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Insights /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/listings" : "/login"} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
