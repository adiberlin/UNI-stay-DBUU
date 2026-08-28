// ============================================================
// src/pages/StudentDashboard.tsx — Student Accommodation Dashboard
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Heart, MessageCircle, LogOut,
  Search, BookmarkCheck, Clock, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/propertyService';
import { PropertyCard } from '../components/PropertyCard';
import { useToast, Toast } from '../components/Toast';
import type { Property, Enquiry } from '../types/property';

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [savedRes, allProps, enqRes] = await Promise.all([
        propertyService.getSaved(),
        propertyService.getAll(),
        propertyService.getEnquiries(),
      ]);

      setSavedIds(savedRes.savedIds || []);
      setSavedProperties(savedRes.properties || []);
      setEnquiries(enqRes || []);

      const rec = allProps
        .filter(p => !savedRes.savedIds.includes(p.id))
        .slice(0, 3);
      setRecommended(rec);
    } catch {
      addToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (propertyId: string) => {
    try {
      if (savedIds.includes(propertyId)) {
        const updatedIds = await propertyService.unsave(propertyId);
        setSavedIds(updatedIds);
        setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
        addToast('Removed from saved stays.', 'info');
      } else {
        const updatedIds = await propertyService.save(propertyId);
        setSavedIds(updatedIds);
        loadDashboardData();
        addToast('Added to saved stays! ❤️', 'success');
      }
    } catch {
      addToast('Failed to update saved properties.', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const statusColor: Record<string, string> = {
    replied: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    closed: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  if (!user) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Profile Card */}
            <aside className="lg:w-72 shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-24"
              >
                {/* Profile Header */}
                <div className="gradient-hero px-6 py-8 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-md bg-indigo-100"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`; }}
                    />
                  </div>
                  <p className="text-white font-bold text-lg">{user.name}</p>
                  <p className="text-indigo-200 text-xs mt-0.5">{user.email}</p>
                  <span className="inline-block mt-3 bg-white/20 text-white text-xs px-3.5 py-1 rounded-full font-semibold">
                    🎓 DBUU Student
                  </span>
                </div>

                {/* Profile Details */}
                <div className="p-5 border-b border-gray-100 text-sm space-y-2.5">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Phone:</span>
                    <span className="font-semibold text-gray-800">{user.phone || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Preference:</span>
                    <span className="font-semibold text-indigo-600">{user.lookingFor || 'All Stays'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Budget:</span>
                    <span className="font-semibold text-green-600">
                      {user.budget ? `Under ₹${user.budget.toLocaleString('en-IN')}` : 'Flexible'}
                    </span>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="p-3 space-y-1">
                  <Link
                    to="/student-dashboard"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-700"
                  >
                    <LayoutDashboard size={16} />
                    Overview
                  </Link>
                  <Link
                    to="/saved"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                  >
                    <Heart size={16} />
                    Saved Stays ({savedIds.length})
                  </Link>
                  <Link
                    to="/search"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                  >
                    <Search size={16} />
                    Search Stays
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </nav>
              </motion.div>
            </aside>

            {/* Main Dashboard Content */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* Welcome Header */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                      Welcome, {user.name.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Here is your student accommodation dashboard for Dev Bhoomi Uttarakhand University.
                    </p>
                  </div>
                  <Link to="/search" className="btn-primary inline-flex items-center gap-2 self-start">
                    <Search size={16} /> Find Stays Near DBUU
                  </Link>
                </div>
              </motion.div>

              {/* Stats Overview */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div className="bg-indigo-50/80 border border-indigo-100 rounded-3xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-100">
                    <BookmarkCheck size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{savedIds.length}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Saved Stays</p>
                  </div>
                </div>

                <div className="bg-green-50/80 border border-green-100 rounded-3xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-green-100">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{enquiries.length}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Enquiries Sent</p>
                  </div>
                </div>

                <div className="bg-purple-50/80 border border-purple-100 rounded-3xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-purple-100">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">Active</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Status</p>
                  </div>
                </div>
              </motion.div>

              {loading ? (
                <div className="py-16 text-center text-gray-400">Loading student records...</div>
              ) : (
                <>
                  {/* My Enquiries Tracker */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <MessageCircle size={20} className="text-indigo-600" />
                        My Stays Enquiries ({enquiries.length})
                      </h2>
                    </div>

                    {enquiries.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">No enquiries sent yet.</p>
                        <Link to="/search" className="text-xs text-indigo-600 font-semibold hover:underline">
                          Explore stays and contact owners →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {enquiries.map(enq => (
                          <div
                            key={enq.id}
                            className="p-4 bg-gray-50 hover:bg-indigo-50/40 rounded-2xl border border-gray-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-sm">{enq.propertyTitle}</span>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusColor[enq.status] || 'bg-gray-100'}`}>
                                  {enq.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 italic line-clamp-1">"{enq.message}"</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                              <Clock size={13} />
                              {new Date(enq.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Saved Properties */}
                  {savedProperties.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Heart size={20} className="text-red-500 fill-current" />
                          My Saved Accommodation ({savedProperties.length})
                        </h2>
                        <Link to="/saved" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                          View All
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {savedProperties.slice(0, 2).map(property => (
                          <PropertyCard
                            key={property.id}
                            property={property}
                            isSaved={true}
                            onToggleSave={handleToggleSave}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Recommended Properties */}
                  {recommended.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">Recommended Near DBUU</h2>
                          <p className="text-xs text-gray-500">Verified stays curated for university students</p>
                        </div>
                        <Link to="/search" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                          Browse All <ChevronRight size={16} />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {recommended.map(property => (
                          <PropertyCard
                            key={property.id}
                            property={property}
                            isSaved={savedIds.includes(property.id)}
                            onToggleSave={handleToggleSave}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
