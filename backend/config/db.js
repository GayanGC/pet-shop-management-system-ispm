/**
 * ============================================================================
 * DATABASE CONFIGURATION (Mongoose MongoDB Connection)
 * ============================================================================
 * Explanation for Viva:
 * - This file connects our Express backend to the MongoDB Atlas Cloud Cluster.
 * - Mongoose acts as an ODM (Object Data Modeling) library for MongoDB and Node.js.
 * - We retrieve the MongoDB URI from environment variables (.env) for security.
 * - The connection URI MUST be set in backend/.env as MONGO_URI=<Atlas connection string>
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[Database Error] ❌ MONGO_URI is not defined in backend/.env');
    console.error('[Database Error] Please set MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/pet_shop_db in backend/.env');
    process.exit(1);
  }

  const isAtlas = uri.includes('mongodb+srv') || uri.includes('mongodb.net');

  try {
    console.log(`[Database] 🔌 Connecting to ${isAtlas ? 'MongoDB Atlas Cloud Cluster' : 'Local MongoDB'}...`);
    const conn = await mongoose.connect(uri);
    const host = conn.connection.host;
    const dbName = conn.connection.name;

    if (isAtlas) {
      console.log(`[Database] ✅ MongoDB Atlas Connected to Cluster: ${host} | Database: ${dbName}`);
    } else {
      console.log(`[Database] ✅ Local MongoDB Connected: ${host} | Database: ${dbName}`);
    }
    console.log(`[Database] 🛡️  Deployment Mode: ${isAtlas ? '☁️  MongoDB Atlas (Remote Cloud Cluster)' : '💻 Local MongoDB'}`);
  } catch (error) {
    console.error(`[Database Error] ❌ MongoDB connection failed: ${error.message}`);

    // Fallback to local MongoDB if Atlas credentials/network require adjustment
    if (isAtlas) {
      try {
        console.log('[Database Fallback] 🔄 Attempting fallback to local MongoDB (127.0.0.1:27017)...');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/pet_shop_db');
        console.log(`[Database Fallback] ✅ Local MongoDB Connected: ${localConn.connection.host} | Database: ${localConn.connection.name}`);
        return;
      } catch (localErr) {
        console.error(`[Database Error] ❌ Local fallback also failed: ${localErr.message}`);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;
