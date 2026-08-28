// ============================================================
// src/components/Navbar.tsx — Role-Aware Sticky Navigation
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, LayoutDashboard, LogIn, PlusCircle, Search, Shield, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled && !menuOpen;

  // Build role-specific navigation links
  const getNavLinks = () => {
    if (!isAuthenticated || !user) {
      return [
        { label: 'Find a Stay', to: '/search', icon: <Search size={15} /> },
        { label: 'Login', to: '/login', icon: <LogIn size={15} /> },
      ];
    }

    if (user.role === 'STUDENT') {
      return [
        { label: 'Find a Stay', to: '/search', icon: <Search size={15} /> },
        { label: 'Saved Stays', to: '/saved', icon: <Heart size={15} /> },
        { label: 'Student Dashboard', to: '/student-dashboard', icon: <LayoutDashboard size={15} /> },
      ];
    }

    if (user.role === 'OWNER') {
      return [
        { label: 'My Dashboard', to: '/owner-dashboard', icon: <Building2 size={15} /> },
        { label: 'List New Property', to: '/post-property', icon: <PlusCircle size={15} /> },
        { label: 'Search Stays', to: '/search', icon: <Search size={15} /> },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        { label: 'Admin Dashboard', to: '/admin-dashboard', icon: <Shield size={15} /> },
        { label: 'All Listings', to: '/search', icon: <Search size={15} /> },
      ];
    }

    return [{ label: 'Find a Stay', to: '/search', icon: <Search size={15} /> }];
  };

  const navLinks = getNavLinks();

  const getRoleDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student-dashboard';
    if (user.role === 'OWNER') return '/owner-dashboard';
    if (user.role === 'ADMIN') return '/admin-dashboard';
    return '/login';
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="UNI stay DBUU Home">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm bg-white p-0.5 border border-white/30 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/logo.png"
                alt="UNI stay DBUU Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className={`font-black text-base leading-none block tracking-tight ${isTransparent ? 'text-white' : 'text-gray-900'}`}>
                UNI stay <span className={isTransparent ? 'text-amber-300' : 'text-[#c8973e]'}>DBUU</span>
              </span>
              <span className={`text-2xs font-medium leading-none uppercase tracking-wider block mt-1 ${isTransparent ? 'text-white/80' : 'text-gray-500'}`}>
                Find Your Home • Focus on Future
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? (isTransparent ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700')
                    : (isTransparent ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-700'
                    : user.role === 'OWNER'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {user.role === 'ADMIN' ? '🛡️ Admin' : user.role === 'OWNER' ? '🏢 Owner' : '🎓 Student'}
                </span>

                <Link
                  to={getRoleDashboardRoute()}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    isTransparent ? 'text-white/90 hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/60 shadow-2xs"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`; }}
                  />
                  <span>{user.name.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isTransparent ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isTransparent ? 'text-white/80 hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <LogIn size={15} />
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isTransparent ? 'bg-white text-indigo-700 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
          >
            <nav className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2 flex flex-col gap-1">
                {user ? (
                  <>
                    <div className="px-3 py-1 flex items-center justify-between text-xs text-gray-500">
                      <span>Logged in as:</span>
                      <span className="font-semibold text-indigo-600 uppercase">{user.role}</span>
                    </div>
                    <Link
                      to={getRoleDashboardRoute()}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                      <LogIn size={15} /> Login
                    </Link>
                    <Link to="/register" className="px-3 py-2.5 rounded-lg text-sm font-semibold text-center bg-indigo-600 text-white hover:bg-indigo-700">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
