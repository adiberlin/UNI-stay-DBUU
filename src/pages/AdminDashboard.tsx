// ============================================================
// src/pages/AdminDashboard.tsx — Complete Platform Management
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Users, Building, AlertTriangle, CheckCircle2,
  Trash2, Search, LogOut, MessageCircle, BarChart3, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/propertyService';
import { useToast, Toast } from '../components/Toast';
import type { Property, UserProfile, AdminStats, Enquiry } from '../types/property';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [enquiriesList, setEnquiriesList] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'enquiries'>('overview');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, propsData, enqsData] = await Promise.all([
        propertyService.getAdminStats(),
        propertyService.getAdminUsers(),
        propertyService.getAdminProperties(),
        propertyService.getEnquiries(),
      ]);

      setStats(statsData);
      setUsersList(usersData);
      setPropertiesList(propsData);
      setEnquiriesList(enqsData);
    } catch {
      addToast('Failed to load admin platform data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    try {
      await propertyService.deleteAdminUser(userId);
      setUsersList(prev => prev.filter(u => u.id !== userId));
      addToast(`User ${userName} deleted successfully.`, 'info');
      const updatedStats = await propertyService.getAdminStats();
      setStats(updatedStats);
    } catch (err: any) {
      addToast(err.message || 'Failed to delete user.', 'error');
    }
  };

  const handleDeleteProperty = async (propId: string, propTitle: string) => {
    if (!window.confirm(`Are you sure you want to remove listing "${propTitle}"?`)) return;

    try {
      await propertyService.delete(propId);
      setPropertiesList(prev => prev.filter(p => p.id !== propId));
      addToast(`Listing "${propTitle}" removed.`, 'info');
      const updatedStats = await propertyService.getAdminStats();
      setStats(updatedStats);
    } catch (err: any) {
      addToast(err.message || 'Failed to delete property.', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredUsers = usersList.filter(u => {
    const matchesRole = !userRoleFilter || u.role === userRoleFilter;
    const matchesSearch =
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredProperties = propertiesList.filter(p => {
    return (
      !searchTerm ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (!user) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Admin Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-100">
                <Shield size={26} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  Platform Admin Dashboard
                </h1>
                <p className="text-gray-500 text-sm">
                  Superuser management for UNI stay DBUU • Logged in as <span className="font-bold text-purple-700">{user.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transition-all"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-gray-200">
            {[
              { key: 'overview', label: 'Platform Overview', icon: <BarChart3 size={16} /> },
              { key: 'users', label: `Users (${usersList.length})`, icon: <Users size={16} /> },
              { key: 'properties', label: `Properties (${propertiesList.length})`, icon: <Building size={16} /> },
              { key: 'enquiries', label: `Enquiries (${enquiriesList.length})`, icon: <MessageCircle size={16} /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); setSearchTerm(''); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-100'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading admin data...</div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-8">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users size={28} />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">{stats.totalStudents}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase">Registered Students</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Building size={28} />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">{stats.totalOwners}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase">Property Owners</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Building size={28} />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">{stats.totalProperties}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase">Total Properties</p>
                      </div>
                    </div>

                    <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-sm flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-100">
                        <CheckCircle2 size={28} />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-emerald-950">{stats.vacantProperties}</p>
                        <p className="text-xs font-bold text-emerald-700 uppercase">🟢 Vacant (Available)</p>
                      </div>
                    </div>

                    <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100 shadow-sm flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-100">
                        <AlertTriangle size={28} />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-rose-950">{stats.occupiedProperties}</p>
                        <p className="text-xs font-bold text-rose-700 uppercase">🔴 Occupied Stays</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <MessageCircle size={28} />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">{stats.totalEnquiries}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase">Student Enquiries</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 text-lg mb-3">User Directory Quick Actions</h3>
                      <p className="text-xs text-gray-500 mb-4">View and moderate registered students, owners, and credentials.</p>
                      <button
                        onClick={() => setActiveTab('users')}
                        className="btn-primary text-sm py-2.5 px-4"
                      >
                        Manage Users Table →
                      </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 text-lg mb-3">Listing Moderation</h3>
                      <p className="text-xs text-gray-500 mb-4">Inspect all student accommodation listings across Dehradun.</p>
                      <button
                        onClick={() => setActiveTab('properties')}
                        className="btn-primary text-sm py-2.5 px-4"
                      >
                        Moderate Properties →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-300"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-gray-400" />
                      <select
                        value={userRoleFilter}
                        onChange={e => setUserRoleFilter(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white font-medium text-gray-700"
                      >
                        <option value="">All Roles</option>
                        <option value="STUDENT">Students Only</option>
                        <option value="OWNER">Owners Only</option>
                        <option value="ADMIN">Admins Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100 font-bold">
                        <tr>
                          <th className="p-4">Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Phone</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Registered</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-bold text-gray-900">{u.name}</td>
                            <td className="p-4 text-gray-600">{u.email}</td>
                            <td className="p-4 text-gray-600">{u.phone || '—'}</td>
                            <td className="p-4">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-700'
                                  : u.role === 'OWNER'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-gray-400">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td className="p-4 text-right">
                              {u.id !== user.id && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete user"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PROPERTIES TAB */}
              {activeTab === 'properties' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="relative max-w-md">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search properties by title or location..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100 font-bold">
                        <tr>
                          <th className="p-4">Property</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Rent</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Owner</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProperties.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-bold text-gray-900">
                              <Link to={`/property/${p.id}`} className="hover:text-purple-700 flex items-center gap-2">
                                <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                <div>
                                  <p className="font-bold">{p.title}</p>
                                  <p className="text-xs text-gray-400 font-normal">{p.location}</p>
                                </div>
                              </Link>
                            </td>
                            <td className="p-4 text-gray-600">{p.type}</td>
                            <td className="p-4 font-bold text-indigo-600">₹{p.price.toLocaleString('en-IN')}/mo</td>
                            <td className="p-4">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                (p.availabilityStatus || 'VACANT') === 'VACANT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {(p.availabilityStatus || 'VACANT') === 'VACANT' ? '🟢 VACANT' : '🔴 OCCUPIED'}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-gray-600">{p.owner?.name || 'Owner'}</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteProperty(p.id, p.title)}
                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                                title="Remove listing"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ENQUIRIES TAB */}
              {activeTab === 'enquiries' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                  <h2 className="text-lg font-bold text-gray-900">Platform Enquiries Log ({enquiriesList.length})</h2>
                  <div className="space-y-3">
                    {enquiriesList.map(enq => (
                      <div key={enq.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{enq.studentName || 'Student'}</span>
                            <span className="text-xs text-gray-400">→</span>
                            <span className="font-semibold text-indigo-700 text-sm">{enq.propertyTitle}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-bold uppercase">
                              {enq.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 italic">"{enq.message}"</p>
                        </div>
                        <div className="text-xs text-gray-400 shrink-0">
                          {new Date(enq.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
