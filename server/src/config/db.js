import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    const uri =  process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error("MongoDB URI is not defined in environment variables!");
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 30 sec ke bajaye 5 sec me detect karega
      family: 4 // IPv4 force karega, IPv6 DNS lookup issue khatam hoga
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Agar DB connect na ho toh server exit ho jaye taaki error seedha log me dikhe
  }
};