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
    const isAtlas = uri.includes('mongodb+srv') || uri.includes('mongodb.net');
    console.log(`[Database] Initializing connection to ${isAtlas ? 'MongoDB Atlas Cloud Cluster' : 'Local MongoDB'}...`);
    const conn = await mongoose.connect(uri);
    console.log(`[Database] Connected Successfully to: ${conn.connection.host}`);
    console.log(`[Database] Active Database: ${conn.connection.name}`);
    console.log(`[Database] Deployment Mode: ${isAtlas ? '☁️ MongoDB Atlas (Remote Cloud Cluster)' : '💻 Local MongoDB'}`);
  } catch (error) {
    console.error(`[Database Error] Primary MongoDB connection failed: ${error.message}`);
    
    // Fallback to local MongoDB if Atlas credentials/network require adjustment
    if (uri.includes('mongodb+srv')) {
      try {
        console.log('[Database Fallback] Attempting fallback to local MongoDB (127.0.0.1:27017)...');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/pet_shop_db');
        console.log(`[Database Fallback] Connected to: ${localConn.connection.host} (${localConn.connection.name})`);
        return;
      } catch (localErr) {
        console.error(`[Database Error] Local fallback also failed: ${localErr.message}`);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;
