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
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pet_shop_db';
  try {
    // Attempt to establish connection to primary MongoDB URI (Atlas or Local)
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Primary connection failed: ${error.message}`);
    
    // Fallback to local MongoDB if Atlas credentials/network require adjustment
    if (uri.includes('mongodb+srv')) {
      try {
        console.log('[Database Fallback] Connecting to local MongoDB (127.0.0.1:27017)...');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/pet_shop_db');
        console.log(`[Database Fallback] Local MongoDB Connected Successfully: ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.error(`[Database Error] Local fallback also failed: ${localErr.message}`);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;
