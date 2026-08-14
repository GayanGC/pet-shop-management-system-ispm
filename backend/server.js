/**
 * ============================================================================
 * PET SHOP MANAGEMENT SYSTEM - MAIN BACKEND SERVER (server.js)
 * ============================================================================
 * Agile Scrum - Sprint 0: Base Setup & Project Foundation
 * 
 * Architecture Explanation for Viva:
 * - Express.js web server handling RESTful API requests.
 * - Modular design isolating 4 sub-modules assigned to 4 team members:
 *   1. Member 1: /api/pets      (Pet Registry & Customer Pet Portal)
 *   2. Member 2: /api/inventory (Inventory & Stock Control System)
 *   3. Member 3: /api/bookings  (Service & Appointment Booking System)
 *   4. Member 4: /api/billing   (Order Processing & POS Billing System)
 * - Shared Modules:
 *   - /api/auth (JWT Authentication & RBAC User Management)
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Database
connectDB();

// Initialize Express Application
const app = express();

// Middleware: Body Parser for incoming JSON requests
app.use(express.json());

// Middleware: Enable Cross-Origin Resource Sharing (CORS) for Frontend React integration
app.use(cors());

// ============================================================================
// API ROUTES REGISTRATION
// ============================================================================

// Base API Status Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'Pet Shop Management System API',
    version: '1.0.0 (Sprint 0 - Base Skeleton)',
    status: 'Server up and running smoothly',
    endpoints: {
      auth: '/api/auth',
      member1_pets: '/api/pets',
      member2_inventory: '/api/inventory',
      member3_bookings: '/api/bookings',
      member4_billing: '/api/billing'
    }
  });
});

// Shared Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Member 1 Module: Pet Registry & Customer Pet Portal Routes
app.use('/api/pets', require('./routes/petRoutes'));

// Member 2 Module: Inventory & Stock Control Routes
app.use('/api/inventory', require('./routes/inventoryRoutes'));

// Member 3 Module: Service & Appointment Booking Routes
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Member 4 Module: Order Processing & POS Billing Routes
app.use('/api/billing', require('./routes/billingRoutes'));

// ============================================================================
// GLOBAL ERROR HANDLING & 404 MIDDLEWARE
// ============================================================================

// Handle 404 Unmatched Routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route Not Found - [${req.method}] ${req.originalUrl}`
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Express HTTP Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Pet Shop Management Backend Server Running!`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🔑 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});
