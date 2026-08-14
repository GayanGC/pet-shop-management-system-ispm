/**
 * MEMBER 1 FRONTEND COMPONENT PLACEHOLDER: PetCard.jsx
 * Assigned to: Team Member 1 (Pet Registry & Customer Pet Portal)
 */

import React from 'react';

const PetCard = ({ pet }) => {
  return (
    <div className="pet-card-placeholder border p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-bold">{pet?.petName || 'Sample Pet Name'}</h3>
      <p>Species: {pet?.species || 'Dog'}</p>
      <p>Breed: {pet?.breed || 'Golden Retriever'}</p>
      <p>Age: {pet?.age || 2} years</p>
      <span className="text-xs text-gray-500">PIN: {pet?.uniquePin || 'PET-001'}</span>
    </div>
  );
};

export default PetCard;
