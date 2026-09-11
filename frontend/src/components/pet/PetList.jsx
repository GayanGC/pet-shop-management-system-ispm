import React, { useState } from 'react';
import { Search, Filter, PawPrint, Trash2, Edit3, Stethoscope, Printer, Archive, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import MedicalHistoryModal from './MedicalHistoryModal';
import PrintableHealthPassportModal from './PrintableHealthPassportModal';

const PetList = ({
  pets = [],
  onDelete,
  onEdit,
  onUpdateClinicStatus,
  onAddMedicalLog,
  onArchivePet,
  searchTerm,
  setSearchTerm,
  speciesFilter,
  setSpeciesFilter,
  includeArchived,
  setIncludeArchived
}) => {
  const [selectedPetForMedical, setSelectedPetForMedical] = useState(null);
  const [selectedPetForPassport, setSelectedPetForPassport] = useState(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
      {/* Search & Filter Header Bar */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Pet Patient Directory</h2>
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
              {pets.length} Patients
            </span>
          </div>
          <p className="text-xs text-slate-500">Clinical Patient Profiles & Microchip Records</p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Include Archived Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={includeArchived || false}
              onChange={(e) => setIncludeArchived && setIncludeArchived(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
            />
            <Archive className="w-3.5 h-3.5 text-slate-500" />
            <span>Include Archived</span>
          </label>

          {/* Search Box */}
          <div className="relative flex-grow md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, PIN, breed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Species Dropdown */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Species</option>
              <option value="Dog">Dog 🐕</option>
              <option value="Cat">Cat 🐈</option>
              <option value="Bird">Bird 🦜</option>
              <option value="Small Mammal">Small Mammal 🐇</option>
              <option value="Primate">Primate 🐒</option>
              <option value="Reptile">Reptile 🐢</option>
              <option value="Aquatic">Aquatic 🐠</option>
              <option value="Farm">Farm & Other 🐐</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Pet PIN Tag</th>
              <th className="py-3.5 px-5">Patient Name</th>
              <th className="py-3.5 px-5">Species / Breed</th>
              <th className="py-3.5 px-5">Age / Weight</th>
              <th className="py-3.5 px-5">Clinic Status</th>
              <th className="py-3.5 px-5">Passport & Logs</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {pets.length > 0 ? (
              pets.map((pet) => (
                <tr
                  key={pet._id}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    pet.isArchived ? 'bg-slate-50/70 opacity-75' : ''
                  }`}
                >
                  <td className="py-3.5 px-5">
                    <span className="bg-slate-100 text-slate-700 font-mono text-[11px] px-2.5 py-1 rounded-md border border-slate-200 font-bold inline-block shadow-2xs">
                      {pet.uniquePin}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {pet.petName ? pet.petName.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{pet.petName}</span>
                        {pet.isArchived && (
                          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded ml-2">
                            Archived
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-5">
                    <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-indigo-100 mr-1.5">
                      {pet.species}
                    </span>
                    <span className="text-slate-500 text-xs">{pet.breed}</span>
                  </td>

                  <td className="py-3.5 px-5 text-slate-600 font-medium">
                    {pet.age} yrs {pet.weight ? `• ${pet.weight} kg` : ''}
                  </td>

                  <td className="py-3.5 px-5">
                    <select
                      value={pet.clinicStatus || 'Registered'}
                      onChange={(e) => onUpdateClinicStatus(pet._id, e.target.value)}
                      className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="Registered">Registered 📝</option>
                      <option value="Checked-In">Checked-In 🏥</option>
                      <option value="In Consultation">In Consultation 🩺</option>
                      <option value="Discharged">Discharged ✅</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPetForMedical(pet)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] rounded-lg border border-indigo-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Stethoscope className="w-3 h-3" /> Logs ({pet.medicalLogs ? pet.medicalLogs.length : 0})
                      </button>

                      <button
                        onClick={() => setSelectedPetForPassport(pet)}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[11px] rounded-lg border border-teal-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Print Official Health Passport"
                      >
                        <Printer className="w-3 h-3" /> Passport
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-right space-x-1">
                    <button
                      onClick={() => onEdit(pet)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                      title="Edit Pet Record"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        const actionText = pet.isArchived ? 'Restore active status for' : 'Archive record for';
                        if (window.confirm(`${actionText} ${pet.petName} (${pet.uniquePin})?`)) {
                          if (onArchivePet) {
                            onArchivePet(pet._id, !pet.isArchived);
                          } else {
                            onDelete(pet._id);
                          }
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-all ${
                        pet.isArchived
                          ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                      }`}
                      title={pet.isArchived ? 'Restore Active Patient' : 'Archive / Deactivate Patient'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-12 px-4 text-center">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto border border-indigo-100">
                      <PawPrint className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">No pet patients found</h3>
                    <p className="text-xs text-slate-400">
                      {searchTerm || speciesFilter !== 'All'
                        ? 'No records match your search or species filter.'
                        : 'Register your first patient using the form above!'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Medical History Modal */}
      {selectedPetForMedical && (
        <MedicalHistoryModal
          pet={selectedPetForMedical}
          onClose={() => setSelectedPetForMedical(null)}
          onAddLog={(id, logData) => {
            onAddMedicalLog(id, logData);
            setSelectedPetForMedical(null);
          }}
        />
      )}

      {/* Health Passport Printable Modal */}
      {selectedPetForPassport && (
        <PrintableHealthPassportModal
          pet={selectedPetForPassport}
          onClose={() => setSelectedPetForPassport(null)}
        />
      )}
    </div>
  );
};

export default PetList;
