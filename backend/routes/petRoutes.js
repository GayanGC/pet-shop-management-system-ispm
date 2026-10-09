const express = require('express');
const router = express.Router();
const {
  petHealthCheck,
  createPet,
  getPetByPin,
  getMyPets,
  searchMyPets,
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
router.get('/my-pets', protect, getMyPets);
router.get('/my', protect, getMyPets);
router.get('/search/my', protect, searchMyPets);
router.get('/pin/:pin', protect, getPetByPin);

router.patch('/:id/archive', protect, archivePet);
router.post('/:id/archive', protect, archivePet);
router.get('/:id/health-passport', protect, getPetHealthSummary);

router.route('/')
  .get(protect, getAllPets)
  .post(protect, createPet);

router.route('/:id')
  .get(protect, getPetById)
  .put(protect, updatePet)
  .delete(protect, deletePet);

router.post('/:id/medical-logs', protect, addMedicalLog);
router.post('/:id/medical-history', protect, addMedicalLog);

module.exports = router;
