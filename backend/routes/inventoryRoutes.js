const express = require('express');
const router = express.Router();
const {
  inventoryHealthCheck,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  adjustStock,
  getExpiringProducts,
  disposeBatch
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/health', inventoryHealthCheck);

router.get('/expiring-soon', getExpiringProducts);
router.post('/dispose-batch/:id', protect, authorize('Admin', 'Staff'), disposeBatch);

router.route('/')
  .get(getAllProducts)
  .post(protect, authorize('Admin', 'Staff'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('Admin', 'Staff'), updateProduct)
  .delete(protect, authorize('Admin', 'Staff'), deleteProduct);

router.put('/:id/stock', protect, authorize('Admin', 'Staff'), adjustStock);

module.exports = router;
