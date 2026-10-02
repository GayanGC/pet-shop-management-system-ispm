import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Shield,
  Stethoscope,
  Package,
  CreditCard,
  CheckCircle,
  RefreshCw,
  Calendar,
  Sparkles
} from 'lucide-react';
import { getStaffDirectory } from '../../services/authService';

const ROLE_CONFIG = {
  veterinarian: {
    label: 'Veterinary Surgeon',
    icon: Stethoscope,
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    dot: 'bg-emerald-500'
  },
  inventory: {
    label: 'Inventory Officer',
    icon: Package,
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    dot: 'bg-amber-500'
  },
  inventory_officer: {
    label: 'Inventory Officer',
    icon: Package,
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    dot: 'bg-amber-500'
  },
  cashier: {
    label: 'POS Cashier',
    icon: CreditCard,
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    dot: 'bg-blue-500'
  },
  admin: {
    label: 'Clinic Administrator',
    icon: Shield,
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    dot: 'bg-purple-500'
  },
  staff: {
    label: 'Clinical Staff',
    icon: Stethoscope,
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border-teal-300 dark:border-teal-700',
    dot: 'bg-teal-500'
  }
};

const StaffDirectory = ({ onOpenRegisterModal }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getStaffDirectory();
      if (res && res.data) {
        setStaff(res.data);
      }
    } catch (err) {
      console.error('Failed to load staff directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(search.toLowerCase()) ||
      member.email?.toLowerCase().includes(search.toLowerCase()) ||
      member.phone?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ||
      member.role === roleFilter ||
      (roleFilter === 'veterinarian' && member.role === 'staff') ||
      (roleFilter === 'inventory' && member.role === 'inventory_officer');

    return matchesSearch && matchesRole;
  });

  const countByRole = (r) => {
    return staff.filter((m) => {
      if (r === 'veterinarian') return m.role === 'veterinarian' || m.role === 'staff';
      if (r === 'inventory') return m.role === 'inventory' || m.role === 'inventory_officer';
      return m.role === r;
    }).length;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Clinical Staff Directory
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                  {staff.length} Active Personnel
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authorized practitioners, pharmacologists, billing cashiers & hospital administrators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchStaff}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh Directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            </button>
            <button
              onClick={onOpenRegisterModal}
              className="bg-teal-700 hover:bg-teal-600 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Register Staff Member
            </button>
          </div>
        </div>

        {/* Operational Statistics Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div
            onClick={() => setRoleFilter(roleFilter === 'veterinarian' ? 'all' : 'veterinarian')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              roleFilter === 'veterinarian'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Veterinarians</span>
              <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {countByRole('veterinarian')}
            </div>
          </div>

          <div
            onClick={() => setRoleFilter(roleFilter === 'inventory' ? 'all' : 'inventory')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              roleFilter === 'inventory'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Pharmacy / Inventory</span>
              <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {countByRole('inventory')}
            </div>
          </div>

          <div
            onClick={() => setRoleFilter(roleFilter === 'cashier' ? 'all' : 'cashier')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              roleFilter === 'cashier'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">POS Cashiers</span>
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {countByRole('cashier')}
            </div>
          </div>

          <div
            onClick={() => setRoleFilter(roleFilter === 'admin' ? 'all' : 'admin')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              roleFilter === 'admin'
                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-1 ring-purple-500'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Administrators</span>
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {countByRole('admin')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search staff by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'veterinarian', 'inventory', 'cashier', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                roleFilter === r
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
          <span>Loading staff directory...</span>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
          <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No staff members found</p>
          <p className="text-xs text-slate-400">
            {search || roleFilter !== 'all' ? 'Try adjusting your filters.' : 'Click "Register Staff Member" to add clinic personnel.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => {
            const roleCfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.staff;
            const Icon = roleCfg.icon;
            const initials = member.name
              ? member.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'ST';

            return (
              <div
                key={member._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top card bar: Avatar + Role Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-teal-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {member.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> Verified Personnel
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${roleCfg.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${roleCfg.dot}`} />
                      {roleCfg.label}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <a
                        href={`mailto:${member.email}`}
                        className="hover:underline font-mono text-slate-700 dark:text-slate-300 truncate"
                        title={member.email}
                      >
                        {member.email}
                      </a>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="font-mono text-slate-700 dark:text-slate-300">{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Join Date */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                  <span className="font-mono uppercase text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                    ID: {member._id ? member._id.slice(-6).toUpperCase() : 'STAFF'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffDirectory;
