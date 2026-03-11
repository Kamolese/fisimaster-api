import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI not configured");
  }
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
