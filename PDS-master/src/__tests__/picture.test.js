const request = require('supertest');
const app = require('../app');

describe('picture route tests', () => {
  let token;
  const badToken = 1234;
  beforeAll(async (done) => {
    try {
      const response = await request(app).post('/api/auth/signin').send({
        username: 'seller1',
        password: 'TESTING1234',
      });
      token = response.body.accessToken;
    } catch (err) {
      console.error(err);
    }
    done();
  });
  afterAll(async (done) => {
    await app.close();

    done();
  });

  describe('/api/room/picture/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const picture = {
      pictureId: 9999,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).put('/api/room/picture/get');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/room/picture/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/room/picture/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });

    it('should respond to the GET method with a 404 for pciture not found', async (done) => {
      const response = await request(app)
        .get(`/api/room/picture/get?pictureId=${picture.pictureId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Picture not found"}');
      done();
    });
  });
});
