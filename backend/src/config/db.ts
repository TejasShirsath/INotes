import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongodbUri = process.env.DB_CONNECTION_URI;
    await mongoose.connect(mongodbUri!);
    console.log('Successfully connected to the database');
  } catch (error) {
    console.log('DB connection failed ', {
      error,
      stackTrace: (error as Error).stack,
    });
  }
};

export default connectDB;
