// ============================================================
// 404 Not Found Page
// ============================================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 bg-white rounded-3xl p-2 flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-100 overflow-hidden">
          <img src="/logo.png" alt="UNI stay DBUU Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-7xl font-extrabold text-indigo-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Looks like this room doesn't exist. Let's help you find a real stay near DBUU.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2">
            <Home size={18} />
            Go Home
          </Link>
          <Link to="/search" className="btn-secondary inline-flex items-center justify-center gap-2">
            Browse Stays
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
