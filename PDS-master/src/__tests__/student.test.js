const request = require('supertest');
const app = require('../app');

describe('student route tests', () => {
  let token;
  const badToken = 1234;
  beforeAll(async (done) => {
    try {
      const response = await request(app).post('/api/auth/signin').send({
        username: 'student1',
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

  describe('/api/student/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).get('/api/student/notUpdate');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/student/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 401 ', async (done) => {
      const response = await request(app)
        .get('/api/student/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });

    it('should respond to the GET method with a 200 ', async (done) => {
      const response = await request(app)
        .get('/api/student/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });
  });

  // Update Student Tests
  describe('/api/student/update', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const ghostStudent = {
      school_name: 'testSchool',
      school_email: 'sOmething234@localhost.com',
    };

    const invalidSchoolEmailOnly = {
      school_email: 'invalidEmail',
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).get('/api/student/notUpdate');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/student/update')
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/student/update')
        .set('Content-Type', 'application/json')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });

    it('should respond to the PUT method with a 200 for student updated', async (done) => {
      const response = await request(app)
        .put('/api/student/update')
        .set('Content-Type', 'application/json')
        .set('x-access-token', token)
        .send(ghostStudent);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 400 for invalid school email', async (done) => {
      const response = await request(app)
        .put('/api/student/update')
        .set('Content-Type', 'application/json')
        .set('x-access-token', token)
        .send(invalidSchoolEmailOnly);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        '{"message":"Provide a school_name and a school_email"}'
      );
      done();
    });
  });
});
