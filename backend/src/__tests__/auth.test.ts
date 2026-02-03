// npm test
import request from 'supertest';
import app from '../app';
import User from '../models/User';

describe('Authentication', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@example.com',
                phone: '08012345678',
                password: 'Password123!'
            });

        expect(res.status).toBe(201);
        expect(res.body.data.user.email).toBe('test@example.com');
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies![0]).toMatch(/token=/);
    });

    it('should not register duplicate user', async () => {
        await User.create({
            firstName: 'John',
            lastName: 'Doe',
            email: 'test@example.com',
            phone: '08012345678',
            password: 'Password123!',
            otp: '1234'
        });

        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@example.com', // Duplicate
                phone: '09012345678',
                password: 'Password123!'
            });

        expect(res.status).toBe(400);
    });

    it('should login valid user', async () => {
        // Manually create user (hashing handled by pre-save hook)
        const user = new User({
            firstName: 'John',
            lastName: 'Doe',
            email: 'login@example.com',
            phone: '08088888888',
            password: 'Password123!'
        });
        await user.save();

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'login@example.com',
                password: 'Password123!'
            });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});
