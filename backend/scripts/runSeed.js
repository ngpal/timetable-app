import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedDatabase from './seedData.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/timetable';

async function runSeed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    await seedDatabase();
    
    console.log('\n🎉 All done! Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runSeed();
