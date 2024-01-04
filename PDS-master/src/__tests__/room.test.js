const request = require('supertest');
const app = require('../app');

describe('rental route tests', () => {
  let token;
  let token2;
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
    try {
      const response2 = await request(app).post('/api/auth/signin').send({
        username: 'seller2',
        password: 'TESTING1234',
      });
      token2 = response2.body.accessToken;
    } catch (err) {
      console.error(err);
    }
    done();
  });
  afterAll(async (done) => {
    await app.close();

    done();
  });

  // Create rental tests
  describe('/api/room/add', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rentalBody = {
      propertyId: 1,
      bed_number: 1,
      wc: 1,
      hvac: 1,
      desk: 1,
      wardrobe: 1,
      kitchen: 1,
      description: 'nice room',
      monthly_fee: 111,
      enabled: 1,
    };

    const noProperty = {
      bed_number: 1,
      wc: 1,
      hvac: 1,
      desk: 1,
      wardrobe: 1,
      kitchen: 1,
      description: 'nice room',
      monthly_fee: 111,
      enabled: 1,
    };

    const invalidProperty = {
      propertyId: -1,
      bed_number: 1,
      wc: 1,
      hvac: 1,
      desk: 1,
      wardrobe: 1,
      kitchen: 1,
      description: 'nice room',
      monthly_fee: 111,
      enabled: 1,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/room/add')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 201 for successfull create', async (done) => {
      const response = await request(app)
        .post('/api/room/add')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(rentalBody);
      expect(response.statusCode).toBe(201);
      done();
    });

    it('should respond to the POST method with a 400 for Provide a propertyId', async (done) => {
      const response = await request(app)
        .post('/api/room/add')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(noProperty);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a propertyId"}');
      done();
    });

    it('should respond to the POST method with a 404 for Property not found', async (done) => {
      const response = await request(app)
        .post('/api/room/add')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(invalidProperty);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Property not found"}');
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .post('/api/room/add')
        .send(rentalBody);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .post('/api/room/add')
        .set('x-access-token', badToken)
        .send(rentalBody);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/room/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const ghostrental = {
      roomId: -1,
    };

    const rental = {
      roomId: 1,
    };

    const nothing = {};

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).post('/api/room/get');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 404 for a room ID that does not exist', async (done) => {
      const response = await request(app)
        .get(`/api/room/get?roomId=${ghostrental.roomId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Room not found"}');
      done();
    });

    it('should respond to the GET method with a 400 for Provide a roomId', async (done) => {
      const response = await request(app)
        .get(`/api/room/get?${nothing}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a roomId"}');
      done();
    });

    it('should respond to the GET method with a 200 for a room get', async (done) => {
      const response = await request(app)
        .get(`/api/room/get?roomId=${rental.roomId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        `/api/room/get?roomId=${ghostrental.roomId}`
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get(`/api/room/get?roomId=${ghostrental.roomId}`)
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/room/update', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const room = {
      roomId: 1,
      bed_number: 2,
    };

    const ghostRoom = {
      roomId: -1,
      bed_number: 2,
    };

    const nothing = {};

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/room/update')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the put method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .put('/api/room/update')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(room);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the put method with a 404 for Room not found', async (done) => {
      const response = await request(app)
        .put('/api/room/update')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(ghostRoom);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Room not found"}');
      done();
    });

    it('should respond to the put method with a 400 for Provide a roomId', async (done) => {
      const response = await request(app)
        .put('/api/room/update')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a roomId"}');
      done();
    });

    it('should respond to the PUT method with a 403 for no token', async (done) => {
      const response = await request(app).put('/api/room/update').send(room);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/room/update')
        .set('x-access-token', badToken)
        .send(room);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/room/remove', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      roomId: 6,
    };

    const ghostRental = {
      roomId: -2,
    };

    const nothing = {};

    const cantDelete = {
      roomId: 3,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .get('/api/room/remove')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the DELETE method with a 200 for successfull remove', async (done) => {
      const response = await request(app)
        .delete('/api/room/remove')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(rental);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"Room Deleted."}');
      done();
    });

    it('should respond to the DELETE method with a 404 for Room not found', async (done) => {
      const response = await request(app)
        .delete('/api/room/remove')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(ghostRental);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Room not found"}');
      done();
    });

    it('should respond to the DELETE method with a 400 for Provide a roomId', async (done) => {
      const response = await request(app)
        .delete('/api/room/remove')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a roomId"}');
      done();
    });

    it('should respond to the DELETE method with a 403 for forbidden because of room with rental history.', async (done) => {
      const response = await request(app)
        .delete('/api/room/remove')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(cantDelete);
      expect(response.statusCode).toBe(403);
      done();
    });

    it('should respond to the DELETE method with a 403 for no token', async (done) => {
      const response = await request(app)
        .delete('/api/room/remove')
        .send(rental);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .delete('/api/room/remove')
        .set('x-access-token', badToken)
        .send(rental);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/room/enable', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      roomId: 2,
    };

    const notRoom = {
      roomId: -1,
    };

    const nothing = {};

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/room/enable')
        .set('x-access-token', token2);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull put', async (done) => {
      const response = await request(app)
        .put('/api/room/enable')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(rental);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 404 ', async (done) => {
      const response = await request(app)
        .put('/api/room/enable')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(notRoom);
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the PUT method with a 400 ', async (done) => {
      const response = await request(app)
        .put('/api/room/enable')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the PUT method with a 403 for no token', async (done) => {
      const response = await request(app).put('/api/room/enable').send(rental);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/room/enable')
        .set('x-access-token', badToken)
        .send(rental);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/room/disable', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      roomId: 7,
      propertyId: 1,
    };

    const ghostRoom = {
      roomId: -1,
    };

    const nothing = {};

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/room/disable')
        .set('x-access-token', token2);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successful disable', async (done) => {
      const response = await request(app)
        .put('/api/room/disable')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(rental);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 404 for room not found ', async (done) => {
      const response = await request(app)
        .put('/api/room/disable')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(ghostRoom);
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the PUT method with a 400 ', async (done) => {
      const response = await request(app)
        .put('/api/room/disable')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the PUT method with a 403 for no token', async (done) => {
      const response = await request(app).put('/api/room/disable').send(rental);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/room/disable')
        .set('x-access-token', badToken)
        .send(rental);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/room/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const property = {
      propertyId: 1,
    };

    const ghostProperty = {
      propertyId: -1,
    };

    const nothing = {};

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/room/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/room/list?propertyId=${property.propertyId}`)
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 404 ', async (done) => {
      const response = await request(app)
        .get(`/api/room/list?propertyId=${ghostProperty.propertyId}`)
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the PUT method with a 400 ', async (done) => {
      const response = await request(app)
        .get(`/api/room/list?${nothing}`)
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        `/api/room/list?propertyId=${property.propertyId}`
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get(`/api/room/list?propertyId=${property.propertyId}`)
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });
});
