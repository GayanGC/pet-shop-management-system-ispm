import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { login, register } from '../../services/authService';

const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    label: 'Admin',
    icon: '👑',
    email: 'admin@4paw.lk',
    password: 'admin123',
    badge: 'Full Clinic Control',
    color: 'border-purple-300 bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-300'
  },
  {
    role: 'customer',
    label: 'Customer',
    icon: '👤',
    email: 'customer@gmail.com',
    password: 'customer123',
    badge: 'Patient Pet Owner',
    color: 'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300'
  },
  {
    role: 'staff',
    label: 'Staff',
    icon: '🩺',
    email: 'staff@4paw.lk',
    password: 'staff123',
    badge: 'Vet & Clinical Logs',
    color: 'border-teal-300 bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:border-teal-800 dark:text-teal-300'
  },
  {
    role: 'inventory_officer',
    label: 'Inventory',
    icon: '📦',
    email: 'inventory@4paw.lk',
    password: 'inv123',
    badge: 'Pharmacy & Stock Lead',
    color: 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300'
  }
];

const AuthModal = ({ isOpen, onClose, onLoginSuccess, initialMessage }) => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialMessage || '');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setLoading(true);
    try {
      const result = await login(account.email, account.password);
      setSuccess(`Logged in as ${account.label} (${result.user.name})`);
      setTimeout(() => {
        onLoginSuccess(result.user);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const result = await login(email, password);
        setSuccess(`Welcome back, ${result.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(result.user);
          onClose();
        }, 500);
      } else {
        const result = await register(name, email, password, role);
        setSuccess(`Account registered! Welcome, ${result.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(result.user);
          onClose();
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 relative transform transition-all duration-300 animate-in fade-in zoom-in-95 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {tab === 'login' ? 'Sign In to 4 Paw Portal' : 'Create Clinical Account'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Role-Based Access Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform duration-200 hover:rotate-90 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Quick Demo Login Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              ⚡ 1-Click Demo Accounts
            </span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Click to Auto-Login</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleDemoLogin(acc)}
                disabled={loading}
                className={`p-2.5 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer ${acc.color}`}
              >
                <span className="text-lg">{acc.icon}</span>
                <div className="overflow-hidden">
                  <span className="font-bold text-xs block leading-tight">{acc.label}</span>
                  <span className="text-[9px] opacity-75 truncate block">{acc.badge}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {tab === 'register' && (
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Kasun Silva"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Select Portal Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:border-teal-600 focus:outline-none font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="customer">👤 Customer (Client Pet Owner)</option>
                <option value="staff">🩺 Staff (Clinical Vet / Nurse)</option>
                <option value="inventory_officer">📦 Inventory Officer (Pharmacy Lead)</option>
                <option value="admin">👑 Admin (Full System Management)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-teal-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                {tab === 'login' ? 'Sign In to Account' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
