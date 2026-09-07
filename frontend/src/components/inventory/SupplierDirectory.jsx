import React, { useState } from 'react';
import { Building2, Plus, Search, Phone, Mail, MapPin, Tag, CheckCircle, XCircle, Edit3, Trash2, X } from 'lucide-react';

const SupplierDirectory = ({ suppliers = [], onAddSupplier, onUpdateSupplier, onDeleteSupplier }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

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
          : supplier.suppliedCategories || '',
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
        suppliedCategories: 'Healthcare, Vaccines',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      ...formData,
      suppliedCategories: formData.suppliedCategories.split(',').map(c => c.trim()).filter(Boolean)
    };

    if (editingSupplier) {
      onUpdateSupplier(editingSupplier._id, payload);
    } else {
      onAddSupplier(payload);
    }

    handleCloseModal();
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm);

    const matchesStatus = statusFilter === 'All' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
      {/* Header & Controls Bar */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Supplier & Distributor Directory
            </h2>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {suppliers.length} Registered Suppliers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage pharmaceutical vendors, authorized distributors, and category channels
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Add Supplier Button */}
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
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
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Supplier / Distributor</th>
              <th className="py-3.5 px-5">Contact Person</th>
              <th className="py-3.5 px-5">Contact Details</th>
              <th className="py-3.5 px-5">Supplied Categories</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200/50">
                        {supplier.name ? supplier.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{supplier.name}</span>
                        {supplier.address && (
                          <span className="text-[11px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {supplier.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-700 font-medium">
                    {supplier.contactPerson || <span className="text-slate-400 italic">Not specified</span>}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="space-y-0.5">
                      {supplier.phone && (
                        <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {supplier.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex flex-wrap gap-1">
                      {supplier.suppliedCategories && supplier.suppliedCategories.length > 0 ? (
                        supplier.suppliedCategories.map((cat, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 border border-slate-200/80 px-2 py-0.5 rounded-md text-[10px] font-medium inline-flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs">General</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1 py-0.5 px-2.5 text-[11px] font-bold rounded-full border ${
                        supplier.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {supplier.status === 'Active' ? (
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-400" />
                      )}
                      {supplier.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-1">
                    <button
                      onClick={() => handleOpenModal(supplier)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                      title="Edit Supplier"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete supplier record '${supplier.name}'?`)) {
                          onDeleteSupplier(supplier._id);
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-12 px-4 text-center">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">No suppliers found</h3>
                    <p className="text-xs text-slate-400">
                      {searchTerm ? 'No supplier matches your search filter.' : 'Click "+ Register Supplier" to add your first vendor!'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Supplier Modal (Blur backdrop dialog) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 space-y-5 relative transform transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingSupplier ? 'Edit Supplier Details' : 'Register New Vendor / Supplier'}
                  </h3>
                  <p className="text-xs text-slate-500">Provide distributor profile & product lines</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-transform duration-200 hover:rotate-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VetMed Lanka Ltd"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Nimal Silva"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 077-1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. orders@vetmed.lk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                  >
                    <option value="Active">Active Vendor</option>
                    <option value="Inactive">Inactive Vendor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. No. 45, Baseline Road, Colombo 09"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Supplied Categories (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vaccines, Antibiotics, Pet Food, Grooming"
                  value={formData.suppliedCategories}
                  onChange={(e) => setFormData({ ...formData, suppliedCategories: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1">Separate category tags with commas.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20"
                >
                  {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDirectory;
