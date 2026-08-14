import React from 'react';

const PetList = ({ pets = [], onDelete, onEdit, searchTerm, setSearchTerm, speciesFilter, setSpeciesFilter }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pet Registry Directory</h2>
          <p className="text-xs text-gray-500">Member 1 Scope - Registered Customer Pets</p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name, PIN or breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-grow md:w-60"
          />

          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="All">All Species</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Fish">Fish</option>
            <option value="Reptile">Reptile</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="p-3">Pet PIN</th>
              <th className="p-3">Pet Name</th>
              <th className="p-3">Species / Breed</th>
              <th className="p-3">Age / Weight</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {pets.length > 0 ? (
              pets.map((pet) => (
                <tr key={pet._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-mono text-xs font-bold text-indigo-600">{pet.uniquePin}</td>
                  <td className="p-3 font-semibold text-gray-800">{pet.petName}</td>
                  <td className="p-3">
                    <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium mr-1">
                      {pet.species}
                    </span>
                    <span className="text-xs text-gray-500">{pet.breed}</span>
                  </td>
                  <td className="p-3 text-xs text-gray-600">
                    {pet.age} yrs {pet.weight ? `• ${pet.weight} kg` : ''}
                  </td>
                  <td className="p-3 text-xs text-gray-700">
                    {pet.ownerId ? pet.ownerId.name || pet.ownerId.email : 'System Admin'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      pet.status === 'Available' ? 'bg-green-100 text-green-700' :
                      pet.status === 'Adopted' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {pet.status || 'Available'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => onEdit(pet)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(pet._id)}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded"
                    >
                      Archive
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-400 text-sm">
                  No pets registered yet. Fill out the form above to add a pet!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PetList;
