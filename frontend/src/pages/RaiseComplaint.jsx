import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Zap,
  Wifi,
  Armchair,
  Sparkles,
  ClipboardList,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  FileText,
  X,
} from 'lucide-react';
import api from '../utils/api';
import { formatToken } from '../utils/helpers';

const CATEGORIES = [
  { id: 'Plumbing', label: 'Plumbing', icon: Wrench, desc: 'Taps, leakage, shower, flush' },
  { id: 'Electrical', label: 'Electrical', icon: Zap, desc: 'Fan, lights, switchboard, AC' },
  { id: 'Internet', label: 'Internet', icon: Wifi, desc: 'Wi-Fi router, LAN, slow speed' },
  { id: 'Furniture', label: 'Furniture', icon: Armchair, desc: 'Bed, study table, chair, cupboard' },
  { id: 'Cleanliness', label: 'Cleanliness', icon: Sparkles, desc: 'Corridor, washroom, trash' },
  { id: 'Other', label: 'Other', icon: ClipboardList, desc: 'Pest control, security, doors' },
];

const SEVERITIES = [
  {
    id: 'low',
    label: 'Low',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-800 peer-checked:border-emerald-600 peer-checked:bg-emerald-100',
    desc: 'Minor inconvenience, can wait 48-72h',
  },
  {
    id: 'medium',
    label: 'Medium',
    color: 'border-amber-200 bg-amber-50 text-amber-800 peer-checked:border-amber-600 peer-checked:bg-amber-100',
    desc: 'Affects daily routine, needs 24h response',
  },
  {
    id: 'high',
    label: 'High',
    color: 'border-orange-200 bg-orange-50 text-orange-800 peer-checked:border-orange-600 peer-checked:bg-orange-100',
    desc: 'Severe blockage or outage, needs 12h response',
  },
  {
    id: 'critical',
    label: 'Critical',
    color: 'border-red-200 bg-red-50 text-red-800 peer-checked:border-red-600 peer-checked:bg-red-100',
    desc: 'Immediate safety hazard, gas/short-circuit/flood',
  },
];

export default function RaiseComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState('Plumbing');
  const [severity, setSeverity] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(user?.room || '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModalData, setSuccessModalData] = useState(null);

  const validate = () => {
    if (!title.trim()) {
      setError('Please provide a title for the issue.');
      return false;
    }
    if (!description.trim()) {
      setError('Please provide a description describing the problem.');
      return false;
    }
    if (!location.trim()) {
      setError('Please specify the exact room / wing location.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setError('');
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        location: location.trim(),
        photoUrl: photoUrl.trim() || undefined,
      };

      const res = await api.post('/complaints', payload);
      const created = res.data.complaint || res.data;
      setSuccessModalData(created);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Raise Maintenance Request
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit details about the malfunction in your room or hostel common area.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={(e) => { e.preventDefault(); validate() && setShowPreview(true); }} className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Step 1: Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            1. Select Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary bg-primary-50/50 ring-2 ring-primary/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                      isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{cat.label}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{cat.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Severity */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            2. Urgency Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SEVERITIES.map((sev) => {
              const isSelected = severity === sev.id;
              return (
                <label
                  key={sev.id}
                  onClick={() => setSeverity(sev.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? `${sev.color} ring-2 ring-offset-1`
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm capitalize">{sev.label}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-current" />
                  </div>
                  <span className="text-[11px] opacity-80">{sev.desc}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Step 3: Title & Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Issue Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Geyser water not heating / Main switch tripping"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Detailed Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the issue clearly. Mention if sparks are seen, water leaking continuously, or specific error indications..."
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Step 4: Location & Optional Photo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              5. Room / Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Room 204, Block B or 2nd floor washroom"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              6. Photo Link / URL (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UploadCloud className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/hostel-pipe.jpg"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Form Submission Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/student')}
            className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary/25 cursor-pointer"
          >
            Preview Request
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Confirmation / Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Confirm Complaint Details</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-semibold text-slate-800">{category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Severity:</span>
                <span className="font-semibold uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-slate-100">
                  {severity}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-semibold text-slate-800">{location}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">Title:</span>
                <div className="font-semibold text-slate-950 p-2.5 bg-slate-50 rounded-lg">
                  {title}
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">Description:</span>
                <div className="text-slate-700 text-xs p-2.5 bg-slate-50 rounded-lg whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                  {description}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Make Changes
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-700 shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal with Token Number */}
      {successModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl border border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">Complaint Logged!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your maintenance ticket has been registered in the system.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Generated Token Number
              </span>
              <span className="text-3xl font-mono font-black text-primary">
                {formatToken(successModalData.token || successModalData.id)}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Hostel maintenance staff has been notified. You can track updates and progress in real time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate('/student')}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => navigate('/student/track')}
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-700 transition-colors shadow-md shadow-primary/20"
              >
                Track Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
