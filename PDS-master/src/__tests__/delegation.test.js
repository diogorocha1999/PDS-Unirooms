const request = require('supertest');
const app = require('../app');

describe('delegation routes tests', () => {
  let token;
  let token2;
  const badToken = 1234;
  beforeAll(async (done) => {
    try {
      const response = await request(app).post('/api/auth/signin').send({
        username: 'seller2',
        password: 'TESTING1234',
      });
      token = response.body.accessToken;

      const response2 = await request(app).post('/api/auth/signin').send({
        username: 'seller1',
        password: 'TESTING1234',
      });
      token2 = response2.body.accessToken;

      done();
    } catch (err) {
      console.error(err);
    }
  });

  afterAll(async (done) => {
    await app.close();

    done();
  });
  // PUT
  describe('/api/delegation/add', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const delegation = {
      propertyId: 1,
      resellerId: 2,
      fee: 20,
    };

    const delegationNoFee = {
      propertyId: 1,
      resellerId: 2,
    };

    const delegationSelf = {
      propertyId: 1,
      resellerId: 3,
      fee: 20,
    };
    // try to sellerId = resellerId

    const notProperty = {
      propertyId: -1,
      resellerId: 2,
      fee: 20,
    };

    const ghostReseller = {
      propertyId: 1,
      resellerId: 20,
      fee: 20,
    };

    it('should respond to the post method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/delegation/add')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the post method with a 404 for invalid property id (not found)', async (done) => {
      const response = await request(app)
        .post('/api/delegation/add')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notProperty);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Property not found"}');
      done();
    });

    it('should respond to the post method with a 400 for no fee', async (done) => {
      const response = await request(app)
        .post('/api/delegation/add')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(delegationNoFee);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        '{"message":"Provide a propertyId, resellerId and fee"}'
      );
      done();
    });

    it('should respond to the post method with a 200 for delegated', async (done) => {
      const response = await request(app)
        .post('/api/delegation/add')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(delegation);
      expect(response.statusCode).toBe(201);
      done();
    });

    it('should respond to the post method with a 403 for cant delegate to self', async (done) => {
      const response = await request(app)
        .post('/api/delegation/add')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(delegationSelf);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"Can\'t self delegate."}');
      done();
    });

    it('should respond to the post method with a 404 for reseller not found', async (done) => {
      const response = await request(app)
        .post('/api/delegation/add')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(ghostReseller);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No seller matches your resellerId"}'
      );
      done();
    });

    it('should respond to the post method with a 403 for no token', async (done) => {
      const response = await request(app)
        .post('/api/delegation/add')
        .send(delegation);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the post method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .post('/api/delegation/add')
        .set('x-access-token', badToken)
        .send(delegation);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/delegation/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const delegation = {
      delegationId: 1,
    };

    const notDelegation = {
      delegationId: -1,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/delegation/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 400 for no delegation Id', async (done) => {
      const response = await request(app)
        .get('/api/delegation/get')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(delegation);
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/delegation/get?delegationId=${delegation.delegationId}`)
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 404 for delegation not found', async (done) => {
      const response = await request(app)
        .get(`/api/delegation/get?delegationId=${notDelegation.delegationId}`)
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Delegation not found"}');
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .get('/api/delegation/get')
        .send(delegation);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/delegation/get')
        .set('x-access-token', badToken)
        .send(delegation);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/delegation/update', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      delegationId: 4,
      fee: 35,
    };

    const notUser = {
      delegationId: 20,
      fee: 10,
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/delegation/update')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid delegation id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/delegation/update')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Delegation not found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .put('/api/delegation/update')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/delegation/update')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/delegation/update')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // DELETE
  describe('/api/delegation/remove', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      delegationId: 3,
    };

    const notUser = {
      delegationId: -1,
    };

    it('should respond to the DELETE method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/delegation/remove')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the DELETE method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .delete('/api/delegation/remove')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Delegation not found"}');
      done();
    });

    it('should respond to the DELETE method with a 200 for successfull remove', async (done) => {
      const response = await request(app)
        .delete('/api/delegation/remove')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the DELETE method with a 403 for no token', async (done) => {
      const response = await request(app)
        .delete('/api/delegation/remove')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the DELETE method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .delete('/api/delegation/remove')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/delegation/createdlist', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/delegation/createdlist')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull retrieval', async (done) => {
      const response = await request(app)
        .get('/api/delegation/createdlist')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/delegation/createdlist');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/delegation/createdlist')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/delegation/assignedlist', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/delegation/assignedlist')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    // it('should respond to the PUT method with a 404 for no assigned delegations (not found)', async (done) => {
    //   const response = await request(app)
    //     .get('/api/delegation/assignedlist')
    //     .set('x-access-token', token)
    //     .set('Content-Type', 'application/json');
    //   expect(response.statusCode).toBe(404);
    //   expect(response.text).toBe('{"message":"No delegation found"}');
    //   done();
    // });

    // it('should respond to the PUT method with a 200 for successfull get', async (done) => {
    //   const response = await request(app)
    //     .get('/api/delegation/assignedlist')
    //     .set('x-access-token', token3) // current delegation in dataset has resellerId as 1, which is admin
    //     .set('Content-Type', 'application/json');
    //   expect(response.statusCode).toBe(200);
    //   done();
    // });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/delegation/assignedlist');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/delegation/assignedlist')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/delegation/approve', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const delegation = {
      delegationId: 1,
      fee: 35,
    };

    const notDelegation = {
      delegationId: 9,
      fee: 35,
    };

    it('should respond to the post method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/delegation/approve')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the post method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/delegation/approve')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notDelegation);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Delegation not found"}');
      done();
    });

    it('should respond to the post method with a 200 for successfull delegation approval', async (done) => {
      const response = await request(app)
        .put('/api/delegation/approve')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(delegation);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"Delegation updated."}');
      done();
    });

    it('should respond to the post method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/delegation/approve')
        .send(delegation);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the post method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/delegation/approve')
        .set('x-access-token', badToken)
        .send(delegation);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });
});
