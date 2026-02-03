import request from 'supertest';
import app from '../app';

// Mock storage service to avoid real S3 calls
jest.mock('../services/storageService', () => ({
    optimizeAndUploadImage: jest.fn().mockResolvedValue({
        url: 'https://fake-r2.com/image.webp',
        key: 'products/image.webp'
    })
}));

describe('Product API', () => {
    it('should list products (empty)', async () => {
        const res = await request(app).get('/api/v1/products');
        expect(res.status).toBe(200);
        expect(res.body.results).toBe(0);
    });

    // Requires admin, which requires a valid token with role 'admin'
    // For integration test complexity, we might skip the full upload test 
    // unless we mock the auth middleware or login as admin first.
    // Let's just test public endpoints for now to confirm "run test first" health check.
});
