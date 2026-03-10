import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config();

const seedCR = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const crEmail = 'cb.en.u4cse21341@cb.students.amrita.edu';
        const crName = 'Test CR (Section D)';

        // Delete existing if any
        await User.findOneAndDelete({ email: crEmail });

        const crUser = await User.create({
            name: crName,
            email: crEmail,
            role: 'Student',
            isCR: true
        });

        console.log('✅ Test CR Account Created:');
        console.log('Email:', crEmail);
        console.log('Name:', crName);
        console.log('Role:', crUser.role);
        console.log('isCR:', crUser.isCR);

        // Also create a normal student for the same section
        const studentEmail = 'cb.en.u4cse21300@cb.students.amrita.edu';
        await User.findOneAndDelete({ email: studentEmail });
        await User.create({
            name: 'Normal Student (Section D)',
            email: studentEmail,
            role: 'Student',
            isCR: false
        });
        console.log('✅ Normal Student Account Created (Section D)');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding CR:', error);
        process.exit(1);
    }
};

seedCR();
