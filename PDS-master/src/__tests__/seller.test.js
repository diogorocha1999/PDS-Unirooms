const request = require('supertest');
const app = require('../app');

describe('seller routes tests', () => {
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

  // GET
  describe('/api/seller/info/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/seller/info/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get('/api/seller/info/get')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/seller/info/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/seller/info/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/seller/info/update', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      iban: 4213219492392193,
    };

    const nothing = {};

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/seller/info/update')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .put('/api/seller/info/update')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 400 for Provide an IBAN', async (done) => {
      const response = await request(app)
        .put('/api/seller/info/update')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.text).toBe('{"message":"Provide an IBAN"}');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/seller/info/update')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/seller/info/update')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/seller/payout/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const payout = {
      payoutId: 3,
    };

    const notPayout = {
      payoutId: -1,
    };

    const nothing = {};

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/seller/payout/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .get(`/api/seller/payout/get?payoutId=${payout.payoutId}`)
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 500 ', async (done) => {
      const response = await request(app)
        .get(`/api/seller/payout/get?${nothing}`)
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(500);
      done();
    });

    it('should respond to the PUT method with a 404 ', async (done) => {
      const response = await request(app)
        .get(`/api/seller/payout/get?payoutId=${notPayout.payoutId}`)
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/seller/payout/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/seller/payout/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/seller/payout/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      from: '2020-04-28 00:00:00',
      to: '2023-05-29 00:00:00',
      status: 1,
    };

    const notUser = {
      from: '2022-04-28 00:00:00',
      to: '2022-04-29 00:00:00',
      status: 1,
    };

    const nothing = {};

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/seller/payout/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .get(
          `/api/seller/payout/list?from=${user.from}&to=${user.to}&status=${user.status}`
        )
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 404', async (done) => {
      const response = await request(app)
        .get(
          `/api/seller/payout/list?from=${notUser.from}&to=${notUser.to}&status=${notUser.status}`
        )
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the PUT method with a 400', async (done) => {
      const response = await request(app)
        .get(
          `/api/seller/payout/list?${nothing}&to=${notUser.to}&status=${notUser.status}`
        )
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .get(
          `/api/seller/payout/list?from=${user.from}&to=${user.to}&status=${user.status}`
        )
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .get('/api/seller/payout/list')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/seller/payout/list')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });
});
