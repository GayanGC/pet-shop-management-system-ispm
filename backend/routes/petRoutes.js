const express = require('express');
const router = express.Router();
const {
  petHealthCheck,
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  deletePet,
  addMedicalLog,
  archivePet,
  getPetHealthSummary
} = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');

router.get('/health', petHealthCheck);

router.patch('/:id/archive', protect, archivePet);
router.get('/:id/health-passport', protect, getPetHealthSummary);

router.route('/')
  .get(protect, getAllPets)
  .post(protect, createPet);

router.route('/:id')
  .get(protect, getPetById)
  .put(protect, updatePet)
  .delete(protect, deletePet);

router.post('/:id/medical-logs', protect, addMedicalLog);

module.exports = router;
