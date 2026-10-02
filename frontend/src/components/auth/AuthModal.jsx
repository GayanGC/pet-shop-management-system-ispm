import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { login, register } from '../../services/authService';

// ─── Validation Helpers ──────────────────────────────────────────────────────
const SRI_LANKA_PHONE_RE = /^(0[7][01245678]\d{7}|\+947[01245678]\d{7})$/;
const EMAIL_RE = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;

// ─── AuthModal Component ─────────────────────────────────────────────────────
const AuthModal = ({ isOpen, onClose, onLoginSuccess, initialMessage }) => {
  if (!isOpen) return null;

  const [tab, setTab] = useState('login'); // 'login' | 'register'

  // Sign In States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole] = useState('customer'); // Always customer for self-registration

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialMessage || '');
  const [success, setSuccess] = useState('');

  // ─── Phone: Only allow numeric input ────────────────────────────────────
  const handlePhoneKeyDown = (e) => {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', '+'];
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // ─── Sign In Submit ──────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!loginIdentifier || !loginPassword) {
      setError('Please provide your Email or Phone Number and Password');
      return;
    }

    setLoading(true);
    try {
      const result = await login(loginIdentifier, loginPassword);
      setSuccess(`Welcome back, ${result.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(result.user);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Registration Submit (single step, no pet wizard) ───────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Full Name Validation ---
    if (!regName.trim() || regName.trim().length < 2) {
      setError('Full name must be at least 2 characters long.');
      return;
    }

    // --- Email / Phone Validation ---
    const emailTrimmed = regEmail.trim();
    const phoneTrimmed = regPhone.trim();

    if (!emailTrimmed && !phoneTrimmed) {
      setError('Please provide at least an Email Address OR a Mobile Phone Number.');
      return;
    }

    if (emailTrimmed && !EMAIL_RE.test(emailTrimmed)) {
      setError('Please provide a valid email address (e.g. name@domain.com).');
      return;
    }

    if (phoneTrimmed && !SRI_LANKA_PHONE_RE.test(phoneTrimmed)) {
      setError('Phone must be a valid Sri Lankan number (e.g. 0771234567 or +94771234567).');
      return;
    }

    // --- Password Validation ---
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: regName.trim(),
        email: emailTrimmed || undefined,
        phone: phoneTrimmed || undefined,
        password: regPassword,
        role: regRole,
        initialPets: [] // No upfront pets — customer adds from their dashboard
      });

      setSuccess(`Account created successfully! Welcome, ${result.user.name}! 🐾`);
      setTimeout(() => {
        onLoginSuccess(result.user);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-teal-100/60 dark:border-slate-800 overflow-hidden my-6 transition-all duration-300">

        {/* Top Gradient Ribbon */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-teal-500 to-emerald-600" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-xl font-black shadow-md shadow-amber-400/20">
              🐾
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                4 Paw Animal Clinic
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 font-mono font-bold">
                  AUTH
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {tab === 'login'
                  ? 'Sign in using your Email OR Phone Number'
                  : 'Create your Pet Parent Account — No upfront setup required'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); }}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In (Email or Phone)
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(''); }}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create Account 🐾
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        <div className="px-6 pt-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* ─── TAB 1: SIGN IN ──────────────────────────────────────────────── */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Email Address OR Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-[10px] text-slate-300 dark:text-slate-600">/</span>
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. customer@gmail.com or 0771234567"
                  className="w-full pl-16 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-700/25 cursor-pointer disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        ) : (
          /* ─── TAB 2: CREATE ACCOUNT (STREAMLINED — NO PET WIZARD) ──── */
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">

            {/* Info Banner */}
            <div className="p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/50 text-xs text-teal-800 dark:text-teal-300 font-medium flex items-start gap-2">
              <span className="text-base shrink-0">🐾</span>
              <span>
                Create your account in seconds. You can register your pets anytime from your
                <strong> My Pets</strong> dashboard after logging in.
              </span>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Kasun Silva"
                  minLength={2}
                  maxLength={60}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address{' '}
                  <span className="text-[10px] text-slate-400 font-normal">(Optional if Phone given)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="kasun@gmail.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mobile Phone{' '}
                  <span className="text-[10px] text-slate-400 font-normal">(Optional if Email given)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                    onKeyDown={handlePhoneKeyDown}
                    placeholder="0771234567 or +94771234567"
                    maxLength={15}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Format: 07XXXXXXXX or +947XXXXXXXX</p>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password <span className="text-[10px] text-slate-400 font-normal">(min 6 chars)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all ${
                      regConfirmPassword && regPassword !== regConfirmPassword
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-teal-500'
                    }`}
                  />
                </div>
                {regConfirmPassword && regPassword !== regConfirmPassword && (
                  <p className="text-[10px] text-rose-500 mt-0.5 font-bold">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Show/Hide Password Toggle */}
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="w-3.5 h-3.5 rounded accent-teal-600 cursor-pointer"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">Show passwords</span>
            </label>

            {/* Role Note */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-slate-200">Role:</strong> Customer (Pet Parent / Client) —
              your account allows you to register pets, book clinical appointments, and shop from our pharmacy.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-700/25 cursor-pointer disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create My Account & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
