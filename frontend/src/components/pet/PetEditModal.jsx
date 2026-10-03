import React, { useState, useEffect } from 'react';
import { X, Edit2, Lock, Save, AlertCircle } from 'lucide-react';
import petService from '../../services/petService';

const SPECIES_OPTIONS = [
  { value: 'Dog', label: 'Canine / Dog 🐕' },
  { value: 'Cat', label: 'Feline / Cat 🐈' },
  { value: 'Bird', label: 'Avian / Bird 🦜' },
  { value: 'Small Mammal', label: 'Small Mammal / Rabbit 🐇' },
  { value: 'Primate', label: 'Primate / Monkey 🐒' },
  { value: 'Reptile', label: 'Reptile / Amphibian 🐢' },
  { value: 'Aquatic', label: 'Aquatic / Fish 🐠' },
  { value: 'Farm', label: 'Farm & Other 🐐' }
];

const GENDER_OPTIONS = ['Male', 'Female', 'Unknown'];

const inputClass =
  'w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all';
const labelClass = 'text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5';

/**
 * Shared Pet Profile Edit Modal (Customer + Admin/Staff)
 * - Pre-populates from the given pet record
 * - Microchip PIN (uniquePin) is rendered read-only and never sent in the payload
 * - Persists via PUT /api/pets/:id (backend enforces customer ownership scoping)
 */
const PetEditModal = ({ pet, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    petName: '',
    species: 'Dog',
    breed: '',
    age: '',
    weight: '',
    gender: 'Male'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pet) return;
    setFormData({
      petName: pet.petName || pet.name || '',
      species: pet.species || 'Dog',
      breed: pet.breed || '',
      age: pet.age ?? '',
      weight: pet.weight ?? '',
      gender: GENDER_OPTIONS.includes(pet.gender) ? pet.gender : 'Male'
    });
    setError('');
  }, [pet]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, isSaving]);

  if (!pet) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = formData.petName.trim();
    const ageNum = Number(formData.age);
    const weightNum = Number(formData.weight);

    if (!trimmedName) return setError('Pet name is required.');
    if (formData.age === '' || Number.isNaN(ageNum) || ageNum < 0 || ageNum > 35) {
      return setError('Age must be a number between 0 and 35 years.');
    }
    if (formData.weight === '' || Number.isNaN(weightNum) || weightNum < 0 || weightNum > 500) {
      return setError('Weight must be a number between 0 and 500 kg.');
    }

    // uniquePin deliberately excluded so the immutable key can never be altered
    const payload = {
      petName: trimmedName,
      species: formData.species,
      breed: formData.breed.trim() || 'Unknown/Mixed',
      age: ageNum,
      weight: weightNum,
      gender: formData.gender
    };

    setIsSaving(true);
    try {
      const res = await petService.updatePet(pet._id, payload);
      if (res && res.success === false) {
        throw new Error(res.message || 'Failed to update pet profile.');
      }
      if (onSaved) await onSaved(res?.data || { ...pet, ...payload });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update pet profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
      onClick={() => !isSaving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pet-edit-title"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-violet-100 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-950/80 border border-violet-600/50 flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-violet-300" />
            </div>
            <div>
              <h2 id="pet-edit-title" className="text-base font-bold">Edit Pet Profile</h2>
              <p className="text-xs text-violet-200/80">
                Updating {pet.petName || pet.name} — changes sync to clinical records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg hover:bg-violet-800/60 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Read-only Microchip PIN */}
          <div>
            <label className={labelClass} htmlFor="pet-edit-pin">Microchip PIN</label>
            <div className="relative">
              <input
                id="pet-edit-pin"
                type="text"
                value={pet.uniquePin || '—'}
                readOnly
                disabled
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Permanent identifier — cannot be changed.</p>
          </div>

          <div>
            <label className={labelClass} htmlFor="pet-edit-name">Pet Name *</label>
            <input
              id="pet-edit-name"
              name="petName"
              type="text"
              required
              value={formData.petName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="pet-edit-species">Species *</label>
              <select
                id="pet-edit-species"
                name="species"
                value={formData.species}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer`}
              >
                {!SPECIES_OPTIONS.some((s) => s.value === formData.species) && (
                  <option value={formData.species}>{formData.species}</option>
                )}
                {SPECIES_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="pet-edit-breed">Breed</label>
              <input
                id="pet-edit-breed"
                name="breed"
                type="text"
                value={formData.breed}
                onChange={handleChange}
                placeholder="e.g. Golden Retriever"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass} htmlFor="pet-edit-age">Age (years) *</label>
              <input
                id="pet-edit-age"
                name="age"
                type="number"
                min="0"
                max="35"
                step="0.1"
                required
                value={formData.age}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="pet-edit-weight">Weight (kg) *</label>
              <input
                id="pet-edit-weight"
                name="weight"
                type="number"
                min="0"
                max="500"
                step="0.1"
                required
                value={formData.weight}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="pet-edit-gender">Gender *</label>
              <select
                id="pet-edit-gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer`}
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetEditModal;
