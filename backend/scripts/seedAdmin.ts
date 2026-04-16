// Usage:
//   ALLOW_PRODUCTION_ADMIN_SEED=true pnpm run seed:admin
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User';

dotenv.config();

const ADMIN_EMAIL = 'admin@plugng.shop';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_PHONE = '+2348107060160';
const DEFAULT_MONGO_URI = 'mongodb://localhost:27017/plugng';

const isLocalMongoUri = (mongoUri: string) => {
    return mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1');
};

const seedAdmin = async () => {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

    if (!isLocalMongoUri(mongoUri) && process.env.ALLOW_PRODUCTION_ADMIN_SEED !== 'true') {
        throw new Error(
            'Refusing to seed a non-local database without ALLOW_PRODUCTION_ADMIN_SEED=true'
        );
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

    if (existingAdmin) {
        existingAdmin.password = ADMIN_PASSWORD;
        existingAdmin.role = 'super_admin';
        existingAdmin.status = 'active';
        existingAdmin.emailVerified = true;
        existingAdmin.phoneVerified = true;

        if (!existingAdmin.phone) {
            existingAdmin.phone = ADMIN_PHONE;
        }

        await existingAdmin.save();
        console.log('Updated existing admin user');
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Role: ${existingAdmin.role}`);
        return;
    }

    const admin = await User.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        firstName: 'Admin',
        lastName: 'User',
        phone: ADMIN_PHONE,
        role: 'super_admin',
        status: 'active',
        emailVerified: true,
        phoneVerified: true
    });

    console.log('Created admin user');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Role: ${admin.role}`);
};

seedAdmin()
    .catch((error) => {
        console.error('Failed to seed admin user:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
