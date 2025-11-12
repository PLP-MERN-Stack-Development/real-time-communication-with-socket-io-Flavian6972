const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // environment variable for MongoDB URI
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chatApp';

    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
