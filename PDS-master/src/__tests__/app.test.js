const request = require('supertest');
const app = require('../app');

describe('app tests', () => {
  it('should export the express app correctly', () => {
    expect(app).toBeTruthy();
  });
  afterAll(async (done) => {
    await app.close();

    done();
  });

  // Basic API Tests
  describe('GET /api/', () => {
    it('should respond to the GET method with 200', async (done) => {
      const response = await request(app).get('/api/');
      expect(response.statusCode).toBe(200);
      done();
    });
  });

  // Non Existing Route Tests
  describe('GET /api/404', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).get('/api/404');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).post('/api/404');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });
  });
});
