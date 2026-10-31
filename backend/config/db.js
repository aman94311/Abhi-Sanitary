import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/abhi_sanitary', {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB Connected]: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.warn(`Tip: If using MongoDB Atlas, make sure your IP is whitelisted (0.0.0.0/0 for anywhere) and your MONGODB_URI in backend/.env is correct.`);
    // Do not terminate process in development so APIs can return proper error messages
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Disconnected from database.');
});

export default connectDB;
