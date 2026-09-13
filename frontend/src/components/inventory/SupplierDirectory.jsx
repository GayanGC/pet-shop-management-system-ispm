import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Tag,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  X,
  Eye,
  Download,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Package
} from 'lucide-react';
import { fetchSuppliers } from '../../services/supplierService';

const SupplierDirectory = ({
  suppliers = [],
  onAddSupplier,
  onCreateSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onRefresh
}) => {
  // Unify create handler
  const handleSaveSupplier = onCreateSupplier || onAddSupplier;

  const [internalSuppliers, setInternalSuppliers] = useState(suppliers || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);

  // Sync props to internal state or fallback fetch
  useEffect(() => {
    if (Array.isArray(suppliers) && suppliers.length > 0) {
      setInternalSuppliers(suppliers);
    } else {
      loadSuppliersDirectly();
    }
  }, [suppliers]);

  const loadSuppliersDirectly = async () => {
    try {
      setIsLoading(true);
      const res = await fetchSuppliers();
      const items = res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(items)) {
        setInternalSuppliers(items);
      }
    } catch (err) {
      console.error('[SupplierDirectory] Error loading suppliers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    suppliedCategories: 'Healthcare, Vaccines',
    status: 'Active'
  });

  const handleOpenModal = (supplier = null) => {
    setErrorMsg('');
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        suppliedCategories: Array.isArray(supplier.suppliedCategories)
          ? supplier.suppliedCategories.join(', ')
          : supplier.suppliedCategories || 'Healthcare',
        status: supplier.status || 'Active'
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        suppliedCategories: 'Healthcare, Vaccines, Antibiotics',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.name.trim()) {
      setErrorMsg('Supplier company name is required.');
      return;
    }

    // Parse categories safely
    let categoriesArray = [];
    if (typeof formData.suppliedCategories === 'string') {
      categoriesArray = formData.suppliedCategories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
    } else if (Array.isArray(formData.suppliedCategories)) {
      categoriesArray = formData.suppliedCategories;
    }
    if (categoriesArray.length === 0) categoriesArray = ['Healthcare'];

    const payload = {
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      suppliedCategories: categoriesArray,
      status: formData.status || 'Active'
    };

    try {
      setIsSubmitting(true);

      if (editingSupplier) {
        if (onUpdateSupplier) {
          const updated = await onUpdateSupplier(editingSupplier._id, payload);
          if (updated) {
            setInternalSuppliers((prev) =>
              prev.map((s) => (s._id === editingSupplier._id ? { ...s, ...payload } : s))
            );
          }
        }
      } else {
        if (handleSaveSupplier) {
          const created = await handleSaveSupplier(payload);
          if (created) {
            const newObj = created.data || created;
            setInternalSuppliers((prev) => [newObj, ...prev.filter((s) => s._id !== newObj._id)]);
          }
        }
      }

      handleCloseModal();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('[SupplierDirectory] Submit error:', err);
      setErrorMsg(err.message || 'Failed to save supplier. Please verify all details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (supplier) => {
    if (!supplier || !supplier._id) return;
    if (window.confirm(`Are you sure you want to delete supplier record "${supplier.name}"?`)) {
      try {
        if (onDeleteSupplier) {
          await onDeleteSupplier(supplier._id);
        }
        setInternalSuppliers((prev) => prev.filter((s) => s._id !== supplier._id));
      } catch (err) {
        console.error('[SupplierDirectory] Delete error:', err);
      }
    }
  };

  // Extract all unique categories for the filter
  const activeSuppliersList = internalSuppliers.length > 0 ? internalSuppliers : suppliers;
  const allCategories = Array.from(
    new Set(
      activeSuppliersList.flatMap((s) =>
        Array.isArray(s.suppliedCategories) ? s.suppliedCategories : []
      )
    )
  ).sort();

  // Filter suppliers
  const filteredSuppliers = activeSuppliersList.filter((supplier) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (supplier.name && supplier.name.toLowerCase().includes(q)) ||
      (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(q)) ||
      (supplier.email && supplier.email.toLowerCase().includes(q)) ||
      (supplier.phone && supplier.phone.includes(q)) ||
      (supplier.address && supplier.address.toLowerCase().includes(q)) ||
      (Array.isArray(supplier.suppliedCategories) &&
        supplier.suppliedCategories.some((cat) => cat.toLowerCase().includes(q)));

    const matchesStatus = statusFilter === 'All' || supplier.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'All' ||
      (Array.isArray(supplier.suppliedCategories) &&
        supplier.suppliedCategories.includes(categoryFilter));

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredSuppliers.length === 0) return;
    const headers = ['Supplier Name', 'Contact Person', 'Phone', 'Email', 'Address', 'Categories', 'Status'];
    const rows = filteredSuppliers.map((s) => [
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.contactPerson || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.address || '').replace(/"/g, '""')}"`,
      `"${(Array.isArray(s.suppliedCategories) ? s.suppliedCategories.join('; ') : '').replace(/"/g, '""')}"`,
      `"${s.status || 'Active'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Supplier_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden space-y-0 transition-colors duration-300">
      {/* Header & Controls Bar */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Pharmaceutical Supplier & Distributor Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized medicine vendors, vaccine procurement lines, and distributor channels
              </p>
            </div>
            <span className="bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-300/60 dark:border-emerald-700/60 shadow-xs">
              {activeSuppliersList.length} Verified Vendors
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendor, contact, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Category Filter */}
          {allCategories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="All">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {/* Refresh */}
          <button
            onClick={() => {
              if (onRefresh) onRefresh();
              loadSuppliersDirectly();
            }}
            disabled={isLoading}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Refresh Suppliers"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Register Supplier Button */}
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Register Supplier
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6">Supplier / Distributor</th>
              <th className="py-4 px-6">Contact Person</th>
              <th className="py-4 px-6">Phone & Email</th>
              <th className="py-4 px-6">Supplied Categories</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <tr
                  key={supplier._id}
                  className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-sm border border-emerald-200/50 dark:border-emerald-800/60 shadow-xs">
                        {supplier.name ? supplier.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {supplier.name}
                          </span>
                          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-200/50 dark:border-emerald-800/40">
                            SUP-{supplier._id?.slice(-4).toUpperCase() || 'VEND'}
                          </span>
                        </div>
                        {supplier.address && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            {supplier.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">
                    {supplier.contactPerson ? (
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {supplier.contactPerson}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Corporate / Direct</span>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      {supplier.phone && (
                        <a
                          href={`tel:${supplier.phone}`}
                          className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono text-[11px] hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                        >
                          <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          {supplier.phone}
                        </a>
                      )}
                      {supplier.email && (
                        <a
                          href={`mailto:${supplier.email}`}
                          className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                        >
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          {supplier.email}
                        </a>
                      )}
                      {!supplier.phone && !supplier.email && (
                        <span className="text-slate-400 text-[11px] italic">No contact provided</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {supplier.suppliedCategories && supplier.suppliedCategories.length > 0 ? (
                        supplier.suppliedCategories.map((cat, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs">General Supplies</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 py-1 px-3 text-[11px] font-black rounded-full border ${
                        supplier.status === 'Active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {supplier.status === 'Active' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      {supplier.status || 'Active'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right space-x-1">
                    {/* View Details */}
                    <button
                      onClick={() => setViewingSupplier(supplier)}
                      className="p-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                      title="View Supplier Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenModal(supplier)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                      title="Edit Supplier"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(supplier)}
                      className="p-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-16 px-4 text-center">
                  <div className="max-w-md mx-auto text-center space-y-3">
                    <div className="w-14 h-14 rounded-3xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-100 dark:border-slate-700 shadow-inner">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-black text-slate-800 dark:text-white">
                      No suppliers match your criteria
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {searchTerm
                        ? `No vendor records match "${searchTerm}". Try resetting your filters.`
                        : 'Register authorized pharmaceutical vendors to manage supply lines and medicine catalogs.'}
                    </p>
                    <button
                      onClick={() => handleOpenModal()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> + Register First Supplier
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: REGISTER / EDIT SUPPLIER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-5 relative transform transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingSupplier ? 'Update Vendor / Supplier' : 'Register New Vendor / Supplier'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pharmaceutical procurement profile & distribution lines
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-transform duration-200 hover:rotate-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Company / Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VetMed Lanka Ltd"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Nimal Silva"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 077-1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. orders@vetmed.lk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Operational Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Active">Active Vendor</option>
                    <option value="Inactive">Inactive Vendor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Physical Address / Headquarters
                </label>
                <input
                  type="text"
                  placeholder="e.g. No. 45, Baseline Road, Colombo 09"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Supplied Categories (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vaccines, Antibiotics, Pet Food, Grooming"
                  value={formData.suppliedCategories}
                  onChange={(e) => setFormData({ ...formData, suppliedCategories: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Tag relevant pharmaceutical categories (e.g. Vaccines, Antibiotics, Dewormers).
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving to DB...
                    </>
                  ) : editingSupplier ? (
                    'Update Supplier Profile'
                  ) : (
                    'Save & Register Supplier'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW SUPPLIER DETAILS CARD */}
      {viewingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-6 relative transform transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20">
                  {viewingSupplier.name ? viewingSupplier.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {viewingSupplier.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-200 dark:border-emerald-800">
                      ID: SUP-{viewingSupplier._id?.slice(-6).toUpperCase() || 'VEND'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        viewingSupplier.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {viewingSupplier.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingSupplier(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-transform hover:rotate-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Contact Representative</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingSupplier.contactPerson || 'Direct / Corporate'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Phone Number</span>
                  <a
                    href={`tel:${viewingSupplier.phone}`}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                  >
                    {viewingSupplier.phone || 'N/A'}
                  </a>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Official Email</span>
                  <a
                    href={`mailto:${viewingSupplier.email}`}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {viewingSupplier.email || 'N/A'}
                  </a>
                </div>
                <div className="flex justify-between items-start text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700">
                  <span className="shrink-0">Warehouse Address</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right ml-4">
                    {viewingSupplier.address || 'Colombo, Sri Lanka'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Authorized Medical Categories:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {viewingSupplier.suppliedCategories && viewingSupplier.suppliedCategories.length > 0 ? (
                    viewingSupplier.suppliedCategories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">General Clinical Inventory</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const s = viewingSupplier;
                  setViewingSupplier(null);
                  handleOpenModal(s);
                }}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
              {viewingSupplier.phone && (
                <a
                  href={`tel:${viewingSupplier.phone}`}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-center flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Supplier
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDirectory;
