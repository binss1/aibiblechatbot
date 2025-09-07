import mongoose from 'mongoose';

let isConnected = false;

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    return mongoose;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  isConnected = true;
  return conn;
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};
