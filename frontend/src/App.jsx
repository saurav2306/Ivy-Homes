import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { clearTokens, getTokens } from "./api";
import { Home, Building2, Bookmark, BarChart3, LogOut, Menu, X } from "lucide-react";
import Login from "./pages/Login";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Projects from "./pages/Projects";
import Rentals from "./pages/Rentals";
import Saved from "./pages/Saved";
import Insights from "./pages/Insights";

function Navbar({ onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Listings", path: "/listings", icon: <Home className="w-4 h-4 mr-2" /> },
    { name: "Rentals", path: "/rentals", icon: <Home className="w-4 h-4 mr-2" /> },
    { name: "Projects", path: "/projects", icon: <Building2 className="w-4 h-4 mr-2" /> },
    { name: "Saved", path: "/saved", icon: <Bookmark className="w-4 h-4 mr-2" /> },
    { name: "Insights", path: "/insights", icon: <BarChart3 className="w-4 h-4 mr-2" /> },
  ];

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl tracking-tight text-black">Ivy Homes</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname.startsWith(link.path)
                      ? "bg-gray-100 text-black"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center">
            <button
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 text-base font-medium ${
                  location.pathname.startsWith(link.path)
                    ? "bg-gray-50 text-black border-l-4 border-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="flex w-full items-center px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
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
      <div className="min-h-screen flex flex-col">
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
