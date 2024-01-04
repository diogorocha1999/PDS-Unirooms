const request = require('supertest');
const app = require('../app');

describe('property routes tests', () => {
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

  describe('/api/property/add', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const property = {
      type: 'big awesome dandy wow',
      address: 'farmville',
      address2: 'farmville2',
      postcode: '4715-007',
      city_id: 1,
      region_id: 1,
      country_id: 1,
    };

    const incProperty = {
      address: 'farmville',
      address2: 'farmville2',
      postcode: '4715-007',
      city_id: 1,
      region_id: 1,
      country_id: 1,
    };

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/property/add')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 200 for successfull add', async (done) => {
      const response = await request(app)
        .post('/api/property/add')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(property);
      expect(response.statusCode).toBe(201);
      done();
    });

    it('should respond to the POST method with a 500 for Error adding property', async (done) => {
      const response = await request(app)
        .post('/api/property/add')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(incProperty);
      expect(response.text).toBe('{"message":"Error adding property"}');
      expect(response.statusCode).toBe(500);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .post('/api/property/add')
        .send(property);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .post('/api/property/add')
        .set('x-access-token', badToken)
        .send(property);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/property/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      propertyId: 1,
    };

    const notUser = {
      propertyId: -1,
    };

    const nothing = {};

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/property/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .get(`/api/property/get?${nothing}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a propertyId"}');
      done();
    });

    it('should respond to the GET method with a 404 for invalid property id (not found)', async (done) => {
      const response = await request(app)
        .get(`/api/property/get?propertyId=${notUser.propertyId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Property not found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/property/get?propertyId=${user.propertyId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        `/api/property/get?propertyId=${user.propertyId}`
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get(`/api/property/get?propertyId=${user.propertyId}`)
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/property/update', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      propertyId: 1,
      type: 'biiiiiiiiiiiiig',
    };

    const notUser = {
      propertyId: -1,
    };

    const nothing = {};

    it('should respond to the put method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/property/update')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .put('/api/property/update')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 404 for Property not found', async (done) => {
      const response = await request(app)
        .put('/api/property/update')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Property not found"}');
      done();
    });

    it('should respond to the PUT method with a 400 for Provide a propertyId', async (done) => {
      const response = await request(app)
        .put('/api/property/update')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a propertyId"}');
      done();
    });

    it('should respond to the put method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/property/update')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the put method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/property/update')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // DELETE
  describe('/api/property/remove', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      propertyId: 1,
    };

    const notUser = {
      propertyId: -1,
    };

    const nothing = {};

    const removeMe = {
      propertyId: 6,
    };

    it('should respond to the put method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/property/remove')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull remove', async (done) => {
      const response = await request(app)
        .delete('/api/property/remove')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(removeMe);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"Property Deleted."}');
      done();
    });

    it('should respond to the PUT method with a 403 for cant remove', async (done) => {
      const response = await request(app)
        .delete('/api/property/remove')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(403);
      done();
    });

    it('should respond to the PUT method with a 400 for Provide a propertyId', async (done) => {
      const response = await request(app)
        .delete('/api/property/remove')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a propertyId"}');
      done();
    });

    it('should respond to the PUT method with a 404 for Property not found', async (done) => {
      const response = await request(app)
        .delete('/api/property/remove')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Property not found"}');
      done();
    });

    it('should respond to the put method with a 403 for no token', async (done) => {
      const response = await request(app)
        .delete('/api/property/remove')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the put method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .delete('/api/property/remove')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/property/enable', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      propertyId: 1,
    };

    const notUser = {
      propertyId: -1,
    };

    const nothing = {};

    it('should respond to the put method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/property/enable')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull enable', async (done) => {
      const response = await request(app)
        .put('/api/property/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 400 for Provide a propertyId', async (done) => {
      const response = await request(app)
        .put('/api/property/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a propertyId"}');
      done();
    });

    it('should respond to the PUT method with a 404 for Property not found', async (done) => {
      const response = await request(app)
        .put('/api/property/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Property not found"}');
      done();
    });

    it('should respond to the put method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/property/enable')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the put method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/property/enable')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/property/disable', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      propertyId: 1,
    };

    const notUser = {
      propertyId: -1,
    };

    const nothing = {};

    it('should respond to the put method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/property/disable')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull disable', async (done) => {
      const response = await request(app)
        .put('/api/property/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 400 for Provide a propertyId', async (done) => {
      const response = await request(app)
        .put('/api/property/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a propertyId"}');
      done();
    });

    it('should respond to the PUT method with a 404 for Property not found', async (done) => {
      const response = await request(app)
        .put('/api/property/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Property not found"}');
      done();
    });

    it('should respond to the put method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/property/disable')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the put method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/property/disable')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/property/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/property/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get('/api/property/list')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    // it('should respond to the PUT method with a 404 for successfull get', async (done) => {
    //   const response = await request(app)
    //     .get('/api/property/list')
    //     .set('x-access-token', token2)
    //     .set('Content-Type', 'application/json');
    //   expect(response.statusCode).toBe(404);
    //   expect(response.text).toBe('{"message":"No properties found"}');
    //   done();
    // });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/property/list');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/property/list')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });
});
