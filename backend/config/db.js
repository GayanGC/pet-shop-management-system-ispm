/**
 * ============================================================================
 * DATABASE CONFIGURATION (Mongoose MongoDB Connection)
 * ============================================================================
 * Explanation for Viva:
 * - This file connects our Express backend to the MongoDB database using Mongoose.
 * - Mongoose acts as an ODM (Object Data Modeling) library for MongoDB and Node.js.
 * - We retrieve the MongoDB URI from environment variables (.env) for security.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to establish connection to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pet_shop_db');
    
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Exit process with failure code if connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
