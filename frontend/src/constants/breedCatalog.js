export const BREED_OPTIONS = {
  'Canine / Dog': [
    'Golden Retriever',
    'Labrador Retriever',
    'German Shepherd',
    'Rottweiler',
    'Pug',
    'Pomeranian',
    'Beagle',
    'Siberian Husky',
    'Boxer',
    'Doberman',
    'Dachshund',
    'Mixed Breed / Local (Sri Lankan)',
    'Other'
  ],
  'Feline / Cat': [
    'Domestic Shorthair (Local)',
    'Persian Cat',
    'Siamese',
    'British Shorthair',
    'Maine Coon',
    'Bengal',
    'Ragdoll',
    'Sphynx',
    'Other'
  ],
  'Avian / Bird': [
    'Budgerigar',
    'Cockatiel',
    'Lovebird',
    'African Grey',
    'Macaw',
    'Canary',
    'Other'
  ],
  'Other / Exotic': [
    'Rabbit',
    'Hamster',
    'Guinea Pig',
    'Turtle / Tortoise',
    'Other'
  ]
};

export const getBreedCategory = (species = '') => {
  const s = String(species).toLowerCase();
  if (s.includes('dog') || s.includes('canine')) return 'Canine / Dog';
  if (s.includes('cat') || s.includes('feline')) return 'Feline / Cat';
  if (s.includes('bird') || s.includes('avian')) return 'Avian / Bird';
  return 'Other / Exotic';
};

export const getBreedsForSpecies = (species = '') => {
  const category = getBreedCategory(species);
  return BREED_OPTIONS[category] || BREED_OPTIONS['Other / Exotic'];
};
