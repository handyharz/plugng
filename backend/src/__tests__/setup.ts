import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

let mongo: MongoMemoryServer;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
        binary: { version: '5.0.10' }
    });
    const uri = mongo.getUri();
    await mongoose.connect(uri);
}, 300000); // 5 minutes timeout

afterAll(async () => {
    if (mongo) {
        await mongoose.disconnect();
        await mongo.stop();
    }
});

afterEach(async () => {
    if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }
});
