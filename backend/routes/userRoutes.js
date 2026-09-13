/**
 * ============================================================================
 * USER & CLIENT DIRECTORY ROUTES (userRoutes.js)
 * ============================================================================
 * Handles customer and client directory endpoints.
 */

const express = require('express');
const router = express.Router();
const { getCustomers, getAllUsers, getUserById } = require('../controllers/userController');

// GET /api/users/customers - returns all registered customers with populated pets
router.get('/customers', getCustomers);

// GET /api/users - returns all users or filters by ?role=customer
router.get('/', getAllUsers);

// GET /api/users/:id - returns user by ID
router.get('/:id', getUserById);

module.exports = router;
