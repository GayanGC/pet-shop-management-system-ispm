/**
 * ============================================================================
 * MEMBER 1 MODULE: PET ROUTES (petRoutes.js)
 * ============================================================================
 * Assigned to: Team Member 1 (Pet Registry & Customer Pet Portal)
 * 
 * Base Path: /api/pets
 */

const express = require('express');
const router = express.Router();
const {
  petHealthCheck,
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  deletePet
} = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');

// Health Check Route (Public for sprint connectivity testing)
router.get('/health', petHealthCheck);

// Protected routes (Requires authentication)
router.route('/')
  .get(protect, getAllPets)
  .post(protect, createPet);

router.route('/:id')
  .get(protect, getPetById)
  .put(protect, updatePet)
  .delete(protect, deletePet);

module.exports = router;
