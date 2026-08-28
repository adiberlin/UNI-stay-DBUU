// ============================================================
// src/pages/PostProperty.tsx — List Property (Max 8 Photos & Validation)
// ============================================================

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, PlusCircle, Home, MapPin, IndianRupee, CheckSquare, Image as ImageIcon } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import { useToast, Toast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import type { PropertyType, RoomType, Furnishing, SuitableFor, AvailabilityStatus } from '../types/property';

const TYPES: PropertyType[] = ['PG', 'Hostel', 'Room', 'Flat'];
const ROOM_TYPES: RoomType[] = ['Single', 'Double Sharing', 'Triple Sharing', '1 BHK', '2 BHK', '3 BHK'];
const FURNISHINGS: Furnishing[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const SUITABLE_FOR: SuitableFor[] = ['Boys', 'Girls', 'Co-living', 'Family'];
const AMENITIES = ['Wi-Fi', 'Food/Mess', 'Parking', 'Laundry', 'AC', 'Power Backup', 'CCTV', 'Hot Water', 'Attached Bathroom', 'Balcony', 'Study Table'];
const AREAS = ['Manduwala', 'Selaqui', 'Bidholi', 'Prem Nagar', 'Sudhowala', 'University Road', 'Other'];

const RULES = [
  { key: 'studentsAllowed', label: 'Students Allowed' },
  { key: 'boysAllowed', label: 'Boys Allowed' },
  { key: 'girlsAllowed', label: 'Girls Allowed' },
  { key: 'foodAvailable', label: 'Food Available' },
  { key: 'petsAllowed', label: 'Pets Allowed' },
  { key: 'smokingAllowed', label: 'Smoking Allowed' },
];

interface FormState {
  title: string;
  description: string;
  type: PropertyType | '';
  area: string;
  address: string;
  distanceFromDBUU: string;
  price: string;
  deposit: string;
  roomType: RoomType | '';
  bathrooms: string;
  squareFt: string;
  furnishing: Furnishing | '';
  suitableFor: SuitableFor | '';
  selectedAmenities: string[];
  rules: Record<string, boolean>;
  images: string[];
  availabilityStatus: AvailabilityStatus;
}

const DEFAULT_FORM: FormState = {
  title: '',
  description: '',
  type: '',
  area: '',
  address: '',
  distanceFromDBUU: '',
  price: '',
  deposit: '',
  roomType: '',
  bathrooms: '1',
  squareFt: '',
  furnishing: '',
  suitableFor: '',
  selectedAmenities: [],
  rules: Object.fromEntries(RULES.map(r => [r.key, false])),
  images: [],
  availabilityStatus: 'VACANT',
};

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">{icon}</div>
      <h3 className="font-bold text-gray-900">{title}</h3>
    </div>
  );
}

export function PostProperty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, addToast, removeToast } = useToast();

  const set = (field: keyof FormState, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }));

  const toggleAmenity = (a: string) => {
    set('selectedAmenities', form.selectedAmenities.includes(a)
      ? form.selectedAmenities.filter(x => x !== a)
      : [...form.selectedAmenities, a]);
  };

  const handleImages = (files: FileList | null) => {
    if (!files) return;

    const fileList = Array.from(files);

    // Hard Limit Check: Maximum 8 photos
    if (form.images.length + fileList.length > 8) {
      addToast('Maximum 8 photos are allowed per property.', 'error');
      return;
    }

    fileList.forEach(file => {
      // Validate file size (< 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast(`File ${file.name} exceeds 5MB limit.`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        setForm(prev => {
          if (prev.images.length >= 8) {
            addToast('Maximum 8 photos are allowed per property.', 'error');
            return prev;
          }
          return {
            ...prev,
            images: [...prev.images, e.target?.result as string],
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Property name/title is required.';
    if (!form.type) e.type = 'Select a property type.';
    if (!form.area) e.area = 'Select an area near DBUU.';

    const numPrice = Number(form.price);
    if (!form.price || isNaN(numPrice) || numPrice <= 0) {
      e.price = 'Enter a valid monthly rent greater than 0.';
    }

    if (form.deposit && (isNaN(Number(form.deposit)) || Number(form.deposit) < 0)) {
      e.deposit = 'Deposit must be a valid non-negative number.';
    }

    const numDist = Number(form.distanceFromDBUU);
    if (!form.distanceFromDBUU || isNaN(numDist) || numDist < 0) {
      e.distanceFromDBUU = 'Enter a valid distance from DBUU.';
    }

    if (!form.roomType) e.roomType = 'Select room type.';
    if (!form.furnishing) e.furnishing = 'Select furnishing status.';
    if (!form.suitableFor) e.suitableFor = 'Select who this accommodation is suitable for.';
    if (form.images.length === 0) e.images = 'Please upload at least 1 property photo (maximum 8 photos).';

    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      addToast(errs.images || 'Please resolve validation errors in the form.', 'error');
      return;
    }

    // Double-check 8 images limit
    if (form.images.length > 8) {
      addToast('Maximum 8 photos are allowed per property.', 'error');
      return;
    }

    setLoading(true);

    try {
      const fullLocation = form.address
        ? `${form.address}, ${form.area}, Dehradun`
        : `${form.area}, Dehradun`;

      await propertyService.create({
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type as PropertyType,
        price: Number(form.price),
        deposit: form.deposit ? Number(form.deposit) : Number(form.price),
        location: fullLocation,
        city: 'Dehradun',
        distanceFromDBUU: Number(form.distanceFromDBUU) || 1.5,
        roomType: form.roomType as RoomType,
        bathrooms: Number(form.bathrooms) || 1,
        area: form.squareFt ? Number(form.squareFt) : undefined,
        furnishing: form.furnishing as Furnishing,
        amenities: form.selectedAmenities,
        suitableFor: form.suitableFor as SuitableFor,
        foodAvailable: form.rules.foodAvailable,
        images: form.images,
        availabilityStatus: form.availabilityStatus,
      });

      addToast('🎉 Listing published successfully!', 'success');
      setTimeout(() => {
        if (user?.role === 'OWNER') {
          navigate('/owner-dashboard');
        } else {
          navigate('/search');
        }
      }, 1200);
    } catch (err: any) {
      addToast(err.message || 'Failed to publish listing. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-3">
                <PlusCircle size={16} />
                Property Owner Portal
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">List Your Property Near DBUU</h1>
              <p className="text-gray-500 max-w-lg mx-auto text-sm">
                Reach thousands of Dev Bhoomi Uttarakhand University students looking for verified stays in Dehradun.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Information */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <SectionHeader icon={<Home size={18} />} title="Basic Property Information" />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Name *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => set('title', e.target.value)}
                      placeholder="e.g. Shivalik Residency, Green View PG..."
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                        errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Describe amenities, study atmosphere, meal timings for DBUU students..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type *</label>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => set('type', t)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                            form.type === t
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {errors.type && <p className="text-red-500 text-xs mt-1 font-medium">{errors.type}</p>}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <SectionHeader icon={<MapPin size={18} />} title="Location Near Campus" />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Area / Locality *</label>
                    <div className="flex flex-wrap gap-2">
                      {AREAS.map(a => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => set('area', a)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                            form.area === a
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                    {errors.area && <p className="text-red-500 text-xs mt-1 font-medium">{errors.area}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address / Landmark</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={e => set('address', e.target.value)}
                        placeholder="e.g. Near Main Gate, Manduwala"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Distance from DBUU (km) *</label>
                      <input
                        type="number"
                        value={form.distanceFromDBUU}
                        onChange={e => set('distanceFromDBUU', e.target.value)}
                        placeholder="e.g. 1.2"
                        step="0.1"
                        min={0}
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                          errors.distanceFromDBUU ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {errors.distanceFromDBUU && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.distanceFromDBUU}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Vacancy */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <SectionHeader icon={<IndianRupee size={18} />} title="Pricing & Vacancy Status" />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monthly Rent (₹) *</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={e => set('price', e.target.value)}
                        placeholder="e.g. 6500"
                        min={1}
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                          errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {errors.price && <p className="text-red-500 text-xs mt-1 font-medium">{errors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Security Deposit (₹)</label>
                      <input
                        type="number"
                        value={form.deposit}
                        onChange={e => set('deposit', e.target.value)}
                        placeholder="e.g. 13000"
                        min={0}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  </div>

                  {/* Vacancy Status Control */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Availability Status *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => set('availabilityStatus', 'VACANT')}
                        className={`p-3.5 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                          form.availabilityStatus === 'VACANT'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        🟢 VACANT (Available)
                      </button>
                      <button
                        type="button"
                        onClick={() => set('availabilityStatus', 'OCCUPIED')}
                        className={`p-3.5 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                          form.availabilityStatus === 'OCCUPIED'
                            ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-xs'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        🔴 OCCUPIED (Currently Full)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room & Accommodation */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <SectionHeader icon={<Home size={18} />} title="Accommodation Details" />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type *</label>
                    <div className="flex flex-wrap gap-2">
                      {ROOM_TYPES.map(rt => (
                        <button
                          key={rt}
                          type="button"
                          onClick={() => set('roomType', rt)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                            form.roomType === rt
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                          }`}
                        >
                          {rt}
                        </button>
                      ))}
                    </div>
                    {errors.roomType && <p className="text-red-500 text-xs mt-1 font-medium">{errors.roomType}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bathrooms</label>
                      <select
                        value={form.bathrooms}
                        onChange={e => set('bathrooms', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        {[1, 2, 3, 4].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area (sq ft)</label>
                      <input
                        type="number"
                        value={form.squareFt}
                        onChange={e => set('squareFt', e.target.value)}
                        placeholder="e.g. 150"
                        min={10}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Furnishing *</label>
                    <div className="flex flex-wrap gap-2">
                      {FURNISHINGS.map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => set('furnishing', f)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                            form.furnishing === f
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    {errors.furnishing && <p className="text-red-500 text-xs mt-1 font-medium">{errors.furnishing}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Suitable For *</label>
                    <div className="flex flex-wrap gap-2">
                      {SUITABLE_FOR.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => set('suitableFor', s)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                            form.suitableFor === s
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {errors.suitableFor && <p className="text-red-500 text-xs mt-1 font-medium">{errors.suitableFor}</p>}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <SectionHeader icon={<CheckSquare size={18} />} title="Amenities & Facilities" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITIES.map(a => (
                    <label
                      key={a}
                      className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer text-sm transition-all border ${
                        form.selectedAmenities.includes(a)
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                          : 'border-gray-100 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.selectedAmenities.includes(a)}
                        onChange={() => toggleAmenity(a)}
                        className="accent-indigo-600"
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <SectionHeader icon={<CheckSquare size={18} />} title="Rules & Food Availability" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {RULES.map(r => (
                    <label
                      key={r.key}
                      className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer text-sm transition-all border ${
                        form.rules[r.key]
                          ? 'bg-green-50 border-green-200 text-green-700 font-semibold'
                          : 'border-gray-100 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.rules[r.key]}
                        onChange={() => set('rules', { ...form.rules, [r.key]: !form.rules[r.key] })}
                        className="accent-green-600"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Property Images — Maximum 8 */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <ImageIcon size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Property Photos</h3>
                      <p className="text-xs text-gray-500">Maximum 8 photos allowed</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    form.images.length === 8
                      ? 'bg-red-100 text-red-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {form.images.length}/8 uploaded
                  </span>
                </div>

                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                  } ${form.images.length >= 8 ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleImages(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} className="text-indigo-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold text-sm mb-1">
                    {form.images.length >= 8 ? 'Maximum limit reached (8 photos)' : 'Upload photos of the accommodation'}
                  </p>
                  <p className="text-gray-400 text-xs">PNG, JPG, WebP up to 5MB each • Up to 8 photos</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImages(e.target.files)}
                  />
                </div>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative h-24 rounded-2xl overflow-hidden border border-gray-200 group">
                        <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1.5 bg-black/60 text-white text-2xs px-1.5 py-0.5 rounded font-bold">
                          #{i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all"
                          title="Remove photo"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 active:scale-98"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle size={20} />
                    Publish Listing on UNI stay DBUU
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
