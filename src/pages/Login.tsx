// ============================================================
// src/pages/Login.tsx — Role-Based Secure Authentication
// ============================================================

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast, Toast } from '../components/Toast';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) {
      e.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Please enter a valid email address.';
    }
    if (!form.password) {
      e.password = 'Password is required.';
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const user = await login(form);
      addToast(`Welcome back, ${user.name}! 🎓`, 'success');

      // Check if redirected from a protected page
      const from = (location.state as any)?.from?.pathname;
      if (from && !['/login', '/register'].includes(from)) {
        navigate(from, { replace: true });
        return;
      }

      // Role-based automatic redirect
      if (user.role === 'STUDENT') {
        navigate('/student-dashboard', { replace: true });
      } else if (user.role === 'OWNER') {
        navigate('/owner-dashboard', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password.';
      setServerError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string, pass: string) => {
    setForm({ email, password: pass });
    setErrors({});
    setServerError(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Header gradient */}
            <div className="gradient-hero px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl p-1 shadow-lg mx-auto mb-4 border border-white/30 overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="UNI stay DBUU Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-1">UNI stay DBUU</h1>
              <p className="text-indigo-200 text-sm">Sign in to access your student stays dashboard</p>
            </div>

            {/* Quick Demo Credentials Bar */}
            <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-3">
              <p className="text-xs font-semibold text-indigo-900 mb-1.5 text-center">Quick Demo Login:</p>
              <div className="flex justify-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => fillDemo('student@dbuu.ac.in', 'Student@12345')}
                  className="text-xs bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 px-2.5 py-1 rounded-lg font-medium transition-all shadow-2xs"
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('owner@dbuu.ac.in', 'Owner@12345')}
                  className="text-xs bg-white text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 px-2.5 py-1 rounded-lg font-medium transition-all shadow-2xs"
                >
                  🏢 Owner
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin@dbuu.ac.in', 'Admin@12345')}
                  className="text-xs bg-white text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 px-2.5 py-1 rounded-lg font-medium transition-all shadow-2xs"
                >
                  🛡️ Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
              {serverError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@dbuu.ac.in"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-70 active:scale-98 shadow-md shadow-indigo-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} /> Sign In
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 pt-2">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                  Register here
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
