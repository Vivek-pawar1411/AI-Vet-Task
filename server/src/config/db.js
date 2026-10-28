import mongoose from "mongoose";

let connectionPromise;

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MongoDB URI is not defined in environment variables!");
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
  }

  const pendingConnection = connectionPromise;
  try {
    const conn = await pendingConnection;
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn.connection;
  } finally {
    if (connectionPromise === pendingConnection) connectionPromise = undefined;
  }
};