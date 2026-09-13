import React, { useState } from 'react';
import {
  Users,
  Search,
  PawPrint,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  LayoutGrid,
  List,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const getSpeciesEmoji = (species = '') => {
  const s = species.toLowerCase();
  if (s.includes('dog') || s.includes('canine')) return '🐕';
  if (s.includes('cat') || s.includes('feline')) return '🐈';
  if (s.includes('bird') || s.includes('avian')) return '🦜';
  if (s.includes('rabbit') || s.includes('mammal')) return '🐇';
  if (s.includes('primate') || s.includes('monkey')) return '🐒';
  if (s.includes('reptile') || s.includes('turtle')) return '🐢';
  if (s.includes('aquatic') || s.includes('fish')) return '🐠';
  return '🐾';
};

const ClientDirectory = ({
  customers = [],
  onRefresh,
  isLoading = false,
  onOpenPassport,
  onOpenReport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [expandedClientIds, setExpandedClientIds] = useState({});

  const toggleExpand = (clientId) => {
    setExpandedClientIds((prev) => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  const expandAll = () => {
    const all = {};
    customers.forEach((c) => {
      all[c._id] = true;
    });
    setExpandedClientIds(all);
  };

  const collapseAll = () => {
    setExpandedClientIds({});
  };

  const filteredCustomers = customers.filter((cust) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = cust.name?.toLowerCase().includes(q);
    const emailMatch = cust.email?.toLowerCase().includes(q);
    const phoneMatch = cust.phone?.toLowerCase().includes(q);
    const petMatch = cust.pets?.some(
      (p) =>
        p.petName?.toLowerCase().includes(q) ||
        p.uniquePin?.toLowerCase().includes(q) ||
        p.breed?.toLowerCase().includes(q)
    );
    return nameMatch || emailMatch || phoneMatch || petMatch;
  });

  const totalRegisteredPets = customers.reduce(
    (acc, c) => acc + (c.pets ? c.pets.length : 0),
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. DIRECTORY HEADER & METRICS */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-700 text-white flex items-center justify-center text-2xl shadow-lg shadow-teal-700/20">
            👥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Registered Clients & Pet Parents Directory
              </h2>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {customers.length} Clients
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified clinical accounts, direct contact demographics, and indexed pet patient portfolios.
            </p>
          </div>
        </div>

        {/* Quick Stats Badges & Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-amber-500 font-black">🐾</span>
            <span className="text-slate-500 dark:text-slate-400">Associated Pets:</span>
            <strong className="text-slate-900 dark:text-white font-mono">{totalRegisteredPets}</strong>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                title="Refresh Client Directory"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}

            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Detailed Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH BAR & QUICK FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, email, phone, or pet PIN (e.g. PET-1024)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold transition-all cursor-pointer"
          >
            Expand All Pets
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold transition-all cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* 3. CLIENT DIRECTORY CONTENT */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-2xl">
            👥
          </div>
          <h3 className="text-base font-black text-slate-800 dark:text-white">
            No Client Profiles Matched
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchTerm
              ? `No registered pet parents found matching "${searchTerm}". Try searching by phone or pet PIN.`
              : 'No client records have been registered in MongoDB yet. Registered customers will appear here automatically.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCustomers.map((client) => {
            const isExpanded = !!expandedClientIds[client._id];
            const clientPets = client.pets || [];

            return (
              <div
                key={client._id}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Client Profile Header */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
                        {client.name ? client.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          {client.name}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                            VERIFIED CLIENT
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Joined: {client.registeredDate ? new Date(client.registeredDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Registered'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0 flex items-center gap-1">
                      <PawPrint className="w-3.5 h-3.5" />
                      {clientPets.length} {clientPets.length === 1 ? 'Pet' : 'Pets'}
                    </span>
                  </div>

                  {/* Demographics Ribbon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 truncate">
                      <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 truncate font-mono text-[11px]">
                        {client.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 truncate">
                      <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 truncate font-mono text-[11px]">
                        {client.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pet Profiles Accordion Drawer */}
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <button
                    type="button"
                    onClick={() => toggleExpand(client._id)}
                    className="w-full px-5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <PawPrint className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      Associated Pets ({clientPets.length})
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      {isExpanded ? 'Hide Pets' : 'View Pet Profiles'}
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-1 space-y-2.5">
                      {clientPets.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2 text-center">
                          No pets registered under this client yet.
                        </p>
                      ) : (
                        clientPets.map((pet) => (
                          <div
                            key={pet._id}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl" role="img" aria-label={pet.species}>
                                {getSpeciesEmoji(pet.species)}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                    {pet.petName}
                                  </h4>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/40">
                                    {pet.uniquePin}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {pet.species} · {pet.breed} · {pet.age} {pet.age === 1 ? 'Year' : 'Years'} · {pet.gender}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                pet.clinicStatus === 'Checked-In'
                                  ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                                  : pet.clinicStatus === 'In Consultation'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {pet.clinicStatus || 'Registered'}
                              </span>

                              {onOpenPassport && (
                                <button
                                  type="button"
                                  onClick={() => onOpenPassport(pet)}
                                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer border border-teal-200/60 dark:border-teal-800"
                                  title="View Clinical Health Passport"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Passport</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DETAILED TABLE VIEW */
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Total Pets</th>
                  <th className="py-3.5 px-4">Associated Patients & PINs</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map((client) => {
                  const clientPets = client.pets || [];
                  const isExpanded = !!expandedClientIds[client._id];

                  return (
                    <React.Fragment key={client._id}>
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white font-black text-xs flex items-center justify-center">
                              {client.name ? client.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <span>{client.name}</span>
                              <span className="block text-[10px] font-normal text-slate-400">
                                Client ID: {client._id.slice(-6).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 font-mono text-[11px]">
                            <p className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-teal-600" /> {client.email}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-teal-600" /> {client.phone}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {client.registeredDate
                            ? new Date(client.registeredDate).toLocaleDateString()
                            : 'Active'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono font-bold">
                            🐾 {clientPets.length}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {clientPets.slice(0, 3).map((p) => (
                              <span
                                key={p._id}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-slate-700"
                                title={`${p.petName} (${p.species})`}
                              >
                                {p.petName} ({p.uniquePin})
                              </span>
                            ))}
                            {clientPets.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                +{clientPets.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => toggleExpand(client._id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <span>{isExpanded ? 'Close' : 'Details'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Accordion Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-800/40">
                          <td colSpan={6} className="p-4 pl-12">
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 space-y-3">
                              <h5 className="text-xs font-black text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                                <PawPrint className="w-4 h-4 text-teal-600" />
                                {client.name}'s Complete Pet Portfolio ({clientPets.length} Registered Patients)
                              </h5>

                              {clientPets.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No pets currently registered.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {clientPets.map((pet) => (
                                    <div
                                      key={pet._id}
                                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <span>{getSpeciesEmoji(pet.species)}</span>
                                            <span>{pet.petName}</span>
                                          </span>
                                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-800 dark:text-amber-300 font-bold">
                                            {pet.uniquePin}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                          {pet.species} · {pet.breed} · {pet.age} Years · {pet.gender}
                                        </p>
                                      </div>

                                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                          Status: {pet.clinicStatus || 'Registered'}
                                        </span>
                                        {onOpenPassport && (
                                          <button
                                            type="button"
                                            onClick={() => onOpenPassport(pet)}
                                            className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                                          >
                                            <FileText className="w-3 h-3" />
                                            Passport
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDirectory;
