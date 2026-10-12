import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  User,
  Mail,
  Lock,
  DoorClosed,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength logic
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide your college email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password, room);
      navigate('/student');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please verify your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left side banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-900 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Wrench className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">FixMyHostel</h1>
            <p className="text-xs text-indigo-200">Smart Hostel Complaint & Maintenance</p>
          </div>
        </div>

        <div className="space-y-6 max-w-md">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Student Portal Onboarding
          </span>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Join the smart hostel maintenance network.
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Create an account to report issues with plumbing, electricity, internet connectivity, or furniture, and receive real-time resolution updates.
          </p>

          <ul className="space-y-3 text-sm text-indigo-100">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Automated token assignment & priority tagging
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Direct notifications as staff accepts your tickets
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Transparent warden oversight and accountability
            </li>
          </ul>
        </div>

        <div className="text-xs text-indigo-300">
          FixMyHostel &bull; Mayank Heda, Ishita Gurbaxani, Bhavisha Kewalramani
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Create an account</h3>
            <p className="text-sm text-slate-500 mt-1">
              Sign up as a student to log maintenance requests
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mayank Heda"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hostel Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mayank@hostel.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Room & Wing (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <DoorClosed className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Room 304, Block B"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Password strength:</span>
                    <span className="font-semibold text-slate-700">
                      {strengthLabels[strength - 1] || 'Too weak'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all ${
                          step <= strength ? strengthColors[strength - 1] : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/25 disabled:opacity-50 transition-all cursor-pointer text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary hover:text-primary-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
