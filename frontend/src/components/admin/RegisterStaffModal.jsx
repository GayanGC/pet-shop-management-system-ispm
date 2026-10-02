import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Stethoscope,
  Package,
  CreditCard,
  Shield
} from 'lucide-react';
import { registerStaff } from '../../services/authService';

const SRI_LANKA_PHONE_RE = /^(?:0|94|\+94)?7[0-9]{8}$/;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const ROLE_OPTIONS = [
  {
    id: 'veterinarian',
    title: 'Veterinary Surgeon',
    desc: 'Patient care, diagnoses, clinical prescriptions & medical histories',
    icon: Stethoscope,
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
  },
  {
    id: 'inventory',
    title: 'Inventory / Pharmacy Officer',
    desc: 'Stock ledger, drug batches, formulary catalog & supplier POs',
    icon: Package,
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700'
  },
  {
    id: 'cashier',
    title: 'POS Billing Cashier',
    desc: 'Point-of-sale invoicing, payment processing & receipt printing',
    icon: CreditCard,
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700'
  },
  {
    id: 'admin',
    title: 'Clinic Administrator',
    desc: 'Full operational governance, financial audits & staff management',
    icon: Shield,
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-700'
  }
];

export const generateSecurePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

const RegisterStaffModal = ({ isOpen, onClose, onStaffCreated }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('veterinarian');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handlePhoneKeyDown = (e) => {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', '+'];
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleGeneratePassword = () => {
    const newPass = generateSecurePassword();
    setPassword(newPass);
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);

    // Validations
    if (!name.trim()) {
      setError('Please provide the staff member’s full official name.');
      return;
    }
    if (!email.trim() || !EMAIL_RE.test(email.trim())) {
      setError('Please provide a valid official email address (e.g., dr.name@4pawclinic.lk).');
      return;
    }
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || !SRI_LANKA_PHONE_RE.test(cleanPhone)) {
      setError('Please provide a valid Sri Lankan mobile number (e.g., 0771234567 or +94771234567).');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long or click "Auto-Generate".');
      return;
    }

    try {
      setLoading(true);
      const res = await registerStaff({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        role,
        password
      });

      setSuccessData({
        staff: res.data,
        message: res.message,
        emailStatus: res.emailStatus,
        plainPassword: password
      });

      if (onStaffCreated) {
        onStaffCreated(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to register staff member.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setRole('veterinarian');
    setPassword('');
    setError('');
    setSuccessData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserPlus className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Register Official Staff Member
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-700/70 border border-teal-500/40 text-teal-100">
                  Admin Only
                </span>
              </h2>
              <p className="text-xs text-teal-100/80">
                Provision verified clinical staff with automated email credential dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Success State Banner */}
          {successData ? (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      Staff Member Successfully Registered!
                    </h3>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                      {successData.message}
                    </p>
                  </div>
                </div>

                {/* Staff Summary Card */}
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3.5 border border-emerald-200 dark:border-emerald-900/60 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Full Name:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{successData.staff?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Official Email:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{successData.staff?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Assigned Role:</span>
                    <span className="font-semibold uppercase text-teal-700 dark:text-teal-400">{successData.staff?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Temporary Password:</span>
                    <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-amber-700 dark:text-amber-400">
                      {successData.plainPassword}
                    </span>
                  </div>
                </div>

                {/* Email Delivery Note */}
                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>
                    Official login credentials & temporary password dispatched to{' '}
                    <strong>{successData.staff?.email}</strong>.
                  </span>
                </div>

                {successData.emailStatus?.simulated && (
                  <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                    ℹ️ <strong>Development Notice:</strong> SMTP credentials are not configured in <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">.env</code>. The full HTML welcome email was safely logged to the server console.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Register Another Staff
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-700 hover:bg-teal-600 text-white cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Kasun Wickramasinghe"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Official Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kasun@4pawclinic.lk"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-slate-400">Credentials will be sent here</span>
                </div>

                {/* Mobile Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onKeyDown={handlePhoneKeyDown}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0771234567"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-slate-400">Sri Lankan mobile (07X XXX XXXX)</span>
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Clinical Role & Authorization Level <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = role === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setRole(item.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 ring-1 ring-teal-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-teal-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </span>
                            <input
                              type="radio"
                              name="role"
                              checked={isSelected}
                              onChange={() => setRole(item.id)}
                              className="text-teal-600 focus:ring-teal-500"
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Password & Generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-Generate Secure Key
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter or generate temporary password"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Min 6 characters. Credentials will be securely bcrypt-hashed in MongoDB and dispatched via email.
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Provisioning Staff...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Register & Dispatch Credentials
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterStaffModal;
