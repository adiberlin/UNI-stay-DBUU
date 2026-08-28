// ============================================================
// src/pages/OwnerDashboard.tsx — Owner Property Management
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, PlusCircle, Trash2, Edit3, CheckCircle2,
  AlertCircle, LogOut, MessageCircle, MapPin, X, Camera,
  Upload, User, Sparkles, Phone, ShieldCheck, Check, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/propertyService';
import { useToast, Toast } from '../components/Toast';
import type { Property, Enquiry, AvailabilityStatus } from '../types/property';

const AVATAR_PRESETS = [
  { id: '1', label: 'Executive 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
  { id: '2', label: 'Professional 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
  { id: '3', label: 'Host 1', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
  { id: '4', label: 'Professional 2', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80' },
  { id: '5', label: 'Host 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80' },
  { id: '6', label: 'Executive 2', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80' },
];

export function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [properties, setProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Property Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    price: 0,
    deposit: 0,
    availabilityStatus: 'VACANT' as AvailabilityStatus,
    description: '',
  });

  // Profile / Avatar (PP) Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [props, enqs] = await Promise.all([
        propertyService.getAll({ ownerId: user.id }),
        propertyService.getEnquiries(),
      ]);
      setProperties(props);
      setEnquiries(enqs);
    } catch {
      addToast('Failed to load properties.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (prop: Property) => {
    const nextStatus: AvailabilityStatus =
      (prop.availabilityStatus || 'VACANT') === 'VACANT' ? 'OCCUPIED' : 'VACANT';

    try {
      const updated = await propertyService.updateAvailability(prop.id, nextStatus);
      setProperties(prev => prev.map(p => (p.id === prop.id ? updated : p)));
      addToast(
        `Property marked as ${nextStatus === 'VACANT' ? '🟢 Available (VACANT)' : '🔴 Occupied (OCCUPIED)'}`,
        'success'
      );
    } catch (err: any) {
      addToast(err.message || 'Failed to update vacancy status.', 'error');
    }
  };

  const handleDeleteProperty = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete listing "${title}"?`)) return;

    try {
      await propertyService.delete(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      addToast('Property deleted successfully.', 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to delete property.', 'error');
    }
  };

  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
    setEditForm({
      title: property.title,
      price: property.price,
      deposit: property.deposit,
      availabilityStatus: property.availabilityStatus || 'VACANT',
      description: property.description,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    try {
      const updated = await propertyService.update(editingProperty.id, {
        title: editForm.title,
        price: Number(editForm.price),
        deposit: Number(editForm.deposit),
        availabilityStatus: editForm.availabilityStatus,
        description: editForm.description,
      });

      setProperties(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      setEditModalOpen(false);
      addToast('Property details updated successfully! 🎉', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update property.', 'error');
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Profile picture size should be under 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setProfileForm(prev => ({ ...prev, avatar: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      setProfileModalOpen(false);
      addToast('Profile picture and details updated successfully! 🎉', 'success');
      loadOwnerData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateEnquiry = async (enquiryId: string, status: 'pending' | 'replied' | 'closed') => {
    try {
      const updated = await propertyService.updateEnquiryStatus(enquiryId, status);
      setEnquiries(prev => prev.map(e => (e.id === enquiryId ? updated : e)));
      addToast(`Enquiry marked as ${status}.`, 'info');
    } catch {
      addToast('Failed to update enquiry status.', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const totalProps = properties.length;
  const vacantProps = properties.filter(p => (p.availabilityStatus || 'VACANT') === 'VACANT').length;
  const occupiedProps = properties.filter(p => p.availabilityStatus === 'OCCUPIED').length;

  const userAvatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`;

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Owner Profile */}
            <aside className="lg:w-72 shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-24"
              >
                {/* Profile Header */}
                <div className="gradient-hero px-6 py-7 text-center relative">
                  {/* Avatar / PP with Camera Edit Overlay */}
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <img
                      src={userAvatar}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover border-3 border-white/80 shadow-lg bg-indigo-100"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`; }}
                    />
                    <button
                      onClick={() => {
                        setProfileForm({
                          name: user.name,
                          phone: user.phone || '',
                          avatar: user.avatar || '',
                        });
                        setProfileModalOpen(true);
                      }}
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-white text-indigo-600 hover:text-indigo-800 rounded-full flex items-center justify-center shadow-md border border-gray-100 transition-transform active:scale-90"
                      title="Update Profile Picture"
                      aria-label="Update Profile Picture"
                    >
                      <Camera size={14} />
                    </button>
                  </div>

                  <p className="text-white font-bold text-lg leading-tight">{user.name}</p>
                  <p className="text-indigo-200 text-xs mt-0.5 break-all">{user.email}</p>
                  <span className="inline-block mt-2.5 bg-amber-500/30 text-amber-200 border border-amber-400/40 text-2xs px-3 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    🏢 Verified Owner
                  </span>
                </div>

                <div className="p-4 border-b border-gray-100 text-sm space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Phone:</span>
                    <span className="font-semibold text-gray-800">{user.phone || '9876543210'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Account:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck size={13} /> Verified
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-1.5">
                  <button
                    onClick={() => {
                      setProfileForm({
                        name: user.name,
                        phone: user.phone || '',
                        avatar: user.avatar || '',
                      });
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all"
                  >
                    <Camera size={14} />
                    Update Profile & Photo
                  </button>

                  <Link
                    to="/post-property"
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
                  >
                    <PlusCircle size={15} />
                    + List New Property
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </motion.div>
            </aside>

            {/* Main Owner Content */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                      Welcome, {user.name} 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Manage your accommodation listings and toggle student vacancy.
                    </p>
                  </div>
                  <Link to="/post-property" className="btn-primary inline-flex items-center gap-2 self-start">
                    <PlusCircle size={18} /> List New Property
                  </Link>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div className="bg-indigo-50/80 border border-indigo-100 rounded-3xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-100">
                    <Building size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{totalProps}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Properties</p>
                  </div>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-100 rounded-3xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-100">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{vacantProps}</p>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">🟢 Vacant / Available</p>
                  </div>
                </div>

                <div className="bg-rose-50/80 border border-rose-100 rounded-3xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-rose-100">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{occupiedProps}</p>
                    <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide">🔴 Occupied</p>
                  </div>
                </div>
              </motion.div>

              {/* Owner Profile Picture (PP) Banner */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5"
              >
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="relative w-16 h-16 shrink-0">
                    <img
                      src={userAvatar}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm bg-indigo-50"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`; }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs shadow-xs">
                      <Camera size={10} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="font-bold text-gray-900 text-base">{user.name}</h3>
                      <span className="badge bg-emerald-100 text-emerald-700 text-2xs py-0.5">Verified Manager</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Phone: <span className="font-semibold text-gray-700">{user.phone || '8271745566'}</span> • Contact details shown on all your property listings
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileForm({
                      name: user.name,
                      phone: user.phone || '',
                      avatar: user.avatar || '',
                    });
                    setProfileModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-2 active:scale-95 shrink-0"
                >
                  <Camera size={14} />
                  Change Profile Picture (PP)
                </button>
              </motion.div>

              {/* My Properties List */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">My Listed Properties ({properties.length})</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Toggle vacancy status to inform DBUU students in real-time.
                    </p>
                  </div>
                  <Link to="/post-property" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <PlusCircle size={16} /> Add Another
                  </Link>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-gray-400">Loading your properties...</div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Building size={40} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-700 mb-1">No properties listed yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Start listing your PG, flat, or room to reach DBUU students.</p>
                    <Link to="/post-property" className="btn-primary inline-flex items-center gap-2">
                      <PlusCircle size={16} /> List Your First Property
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.map(property => {
                      const isVacant = (property.availabilityStatus || 'VACANT') === 'VACANT';

                      return (
                        <div
                          key={property.id}
                          className="bg-gray-50 hover:bg-white rounded-2xl border border-gray-200/80 p-4 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Property Details */}
                          <div className="flex items-start gap-4">
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 text-base">{property.title}</h3>
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                                  {property.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                                <MapPin size={13} className="text-indigo-400" />
                                {property.location} • {property.distanceFromDBUU} km from DBUU
                              </div>
                              <p className="text-sm font-bold text-indigo-700">
                                ₹{property.price.toLocaleString('en-IN')}<span className="text-xs text-gray-400 font-normal">/month</span>
                              </p>
                            </div>
                          </div>

                          {/* Vacancy Toggle & Actions */}
                          <div className="flex flex-wrap items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-200">
                            {/* Availability Toggle Button */}
                            <button
                              onClick={() => handleToggleAvailability(property)}
                              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                                isVacant
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                              }`}
                              title="Click to toggle Vacant/Occupied status"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
                              {isVacant ? '🟢 VACANT (Available)' : '🔴 OCCUPIED'}
                            </button>

                            {/* View Live */}
                            <Link
                              to={`/property/${property.id}`}
                              className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-all"
                            >
                              View
                            </Link>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEdit(property)}
                              className="flex items-center gap-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-all"
                            >
                              <Edit3 size={13} />
                              Edit
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteProperty(property.id, property.title)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete listing"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Student Enquiries for Owner's Properties */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle size={22} className="text-indigo-600" />
                  Received Student Enquiries ({enquiries.length})
                </h2>

                {enquiries.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">No student enquiries received yet.</p>
                ) : (
                  <div className="space-y-3">
                    {enquiries.map(enq => (
                      <div key={enq.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-gray-900 text-sm">{enq.studentName || 'Student'}</span>
                            <span className="text-xs text-gray-500 ml-2">for {enq.propertyTitle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">Status:</span>
                            <select
                              value={enq.status}
                              onChange={e => handleUpdateEnquiry(enq.id, e.target.value as any)}
                              className="text-xs font-bold border border-gray-200 rounded-lg px-2 py-1 bg-white"
                            >
                              <option value="pending">🟡 Pending</option>
                              <option value="replied">🟢 Replied</option>
                              <option value="closed">⚪ Closed</option>
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-100">
                          "{enq.message}"
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📧 {enq.studentEmail}</span>
                          {enq.studentPhone && <span>📞 +91 {enq.studentPhone}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Property Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">Edit Property Details</h3>
                <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Property Name</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Monthly Rent (₹)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300"
                      min={1}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Deposit (₹)</label>
                    <input
                      type="number"
                      value={editForm.deposit}
                      onChange={e => setEditForm(f => ({ ...f, deposit: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300"
                      min={0}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vacancy Status</label>
                  <select
                    value={editForm.availabilityStatus}
                    onChange={e => setEditForm(f => ({ ...f, availabilityStatus: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="VACANT">🟢 VACANT (Available for students)</option>
                    <option value="OCCUPIED">🔴 OCCUPIED (Currently full)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-5 py-2.5 text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Owner Profile Picture (PP) & Info Modal */}
      <AnimatePresence>
        {profileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl border border-gray-100 my-8 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Camera size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">Update Profile Picture</h3>
                    <p className="text-xs text-gray-400">Personalize your owner profile and student contact card</p>
                  </div>
                </div>
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Live Preview & File Upload */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="relative w-24 h-24 shrink-0">
                    <img
                      src={profileForm.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name || 'Owner')}&background=4f46e5&color=fff`}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name || 'Owner')}&background=4f46e5&color=fff`; }}
                    />
                    <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm border-2 border-white">
                      ✓
                    </span>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-bold text-gray-800 mb-1">Upload New Photo</p>
                    <p className="text-xs text-gray-500 mb-3">Upload JPG, PNG or WebP image (Max 5MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                      id="owner-avatar-input"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-2xs transition-all active:scale-95"
                    >
                      <Upload size={14} className="text-indigo-600" />
                      Choose from Computer / Phone
                    </button>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" /> Or Choose a Verified Avatar Preset:
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_PRESETS.map(preset => {
                      const isSelected = profileForm.avatar === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setProfileForm(f => ({ ...f, avatar: preset.url }))}
                          className={`relative rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${
                            isSelected
                              ? 'border-indigo-600 ring-2 ring-indigo-200 scale-105'
                              : 'border-gray-200 hover:border-indigo-300 opacity-80 hover:opacity-100'
                          }`}
                          title={preset.label}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-12 rounded-xl object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                              <Check size={16} className="text-white drop-shadow" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-gray-400" /> Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={profileForm.avatar}
                    onChange={e => setProfileForm(f => ({ ...f, avatar: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                  />
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <User size={13} className="text-gray-400" /> Owner Display Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Phone size={13} className="text-gray-400" /> Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="e.g. 8271745566"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        Save Profile & Photo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
