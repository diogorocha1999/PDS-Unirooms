const request = require('supertest');
const app = require('../app');

describe('rental route tests', () => {
  let token;
  let token2;
  const badToken = 1234;
  beforeAll(async (done) => {
    try {
      const response = await request(app).post('/api/auth/signin').send({
        username: 'silvesterstaline',
        password: 'TESTING1234',
      });
      token = response.body.accessToken;

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
  describe('/api/rental/student/create', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rentalBody = {
      from: new Date(),
      duration: 2,
      bill_day: 15,
      monthly_fee: 200,
      roomId: 4,
      studentId: 1,
    };

    const noId = {
      from: new Date(),
      duration: 2,
      bill_day: 15,
      monthly_fee: 200,
      studentId: 1,
    };

    const incRental = {
      duration: 2,
      bill_day: 15,
      monthly_fee: 200,
      roomId: 8,
      studentId: 1,
    };

    const user = {
      userId: 1,
    };

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/rental/student/create')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 201 for successfull create', async (done) => {
      const response = await request(app)
        .post('/api/rental/student/create')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(rentalBody);
      expect(response.statusCode).toBe(201);
      done();
    });

    it('should respond to the POST method with a 400 for Provide a roomId', async (done) => {
      const response = await request(app)
        .post('/api/rental/student/create')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(noId);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a roomId"}');
      done();
    });

    it('should respond to the POST method with a 400 for Provide a from date, and the duration in months', async (done) => {
      const response = await request(app)
        .post('/api/rental/student/create')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(incRental);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        '{"message":"Provide a from date, and the duration in months"}'
      );
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .post('/api/rental/student/create')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .post('/api/rental/student/create')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/rental/student/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const ghostrental = {
      rentalId: -1,
    };

    const rental = {
      rentalId: 4,
    };

    const nothing = {};

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).post('/api/rental/student/get');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 404 for a rental ID that does not exist', async (done) => {
      const response = await request(app)
        .get(`/api/rental/student/get?rentalId=${ghostrental.rentalId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Rental not found"}');
      done();
    });

    it('should respond to the GET method with a 404 for Provide a rentalId', async (done) => {
      const response = await request(app)
        .get(`/api/rental/student/get?${nothing}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a rentalId"}');
      done();
    });

    it('should respond to the GET method with a 200 for a successfull retrieval', async (done) => {
      const response = await request(app)
        .get(`/api/rental/student/get?rentalId=${rental.rentalId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        `/api/rental/student/get?rentalId=${ghostrental.rentalId}`
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get(`/api/rental/student/get?rentalId=${ghostrental.rentalId}`)
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/rental/student/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      rental_status: 1,
      payment_status: 1,
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/rental/student/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200', async (done) => {
      const response = await request(app)
        .get(
          `/api/rental/student/list?rental_status=${rental.rental_status}&payment_status=${rental.payment_status}`
        )
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        `/api/rental/student/list?rental_status=${rental.rental_status}&payment_status=${rental.payment_status}`
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get(
          `/api/rental/student/list?rental_status=${rental.rental_status}&payment_status=${rental.payment_status}`
        )
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/rental/student/cancel', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      rentalId: 5,
    };

    const notRental = {
      rentalId: -2,
    };

    const nothing = {};

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .get('/api/rental/student/cancel')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .put('/api/rental/student/cancel')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(rental);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"Rental Canceled."}');
      done();
    });

    it('should respond to the PUT method with a 404 for No rentals found', async (done) => {
      const response = await request(app)
        .put('/api/rental/student/cancel')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notRental);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"No rentals found"}');
      done();
    });

    it('should respond to the PUT method with a 400 for Provide a rentalId', async (done) => {
      const response = await request(app)
        .put('/api/rental/student/cancel')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a rentalId"}');
      done();
    });

    it('should respond to the PUT method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/rental/student/cancel')
        .send(rental);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/rental/student/cancel')
        .set('x-access-token', badToken)
        .send(rental);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/rental/student/bookeddates', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      rentalId: 3,
    };

    const notRental = {
      rentalId: -3,
    };

    const nothing = {};

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/rental/student/bookeddates')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/rental/student/bookeddates?rentalId=${rental.rentalId}`)
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404 ', async (done) => {
      const response = await request(app)
        .get(`/api/rental/student/bookeddates?rentalId=${notRental.rentalId}`)
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400 ', async (done) => {
      const response = await request(app)
        .get(`/api/rental/student/bookeddates?${nothing}`)
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        `/api/rental/student/bookeddates?rentalId=${rental.rentalId}`
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get(`/api/rental/student/bookeddates?rentalId=${rental.rentalId}`)
        .set('x-access-token', badToken)
        .send(rental);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // -------------------------------------------------------------
  // -------------------------- SELLER ---------------------------
  // -------------------------------------------------------------

  describe('/api/rental/seller/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      rentalId: 3,
    };

    const notRental = {
      rentalId: -3,
    };

    const nothing = {};

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/rental/seller/get')
        .set('x-access-token', token2);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/rental/seller/get?rentalId=${rental.rentalId}`)
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404', async (done) => {
      const response = await request(app)
        .get(`/api/rental/seller/get?rentalId=${notRental.rentalId}`)
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400', async (done) => {
      const response = await request(app)
        .get(`/api/rental/seller/get?${nothing}`)
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        `/api/rental/seller/get?rentalId=${rental.rentalId}`
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get(`/api/rental/seller/get?rentalId=${rental.rentalId}`)
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/rental/seller/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      rental_status: 0,
      payment_status: 0,
    };

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/rental/seller/list')
        .set('x-access-token', token2);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(
          `/api/rental/seller/list?rental_status=${rental.rental_status}&payment_status=${rental.payment_status}`
        )
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        `/api/rental/seller/list?rental_status=${rental.rental_status}&payment_status=${rental.payment_status}`
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get(
          `/api/rental/seller/list?rental_status=${rental.rental_status}&payment_status=${rental.payment_status}`
        )
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/rental/seller/cancel', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      rentalId: 6,
    };

    const notRental = {
      rentalId: -2,
    };

    const nothing = {};

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/rental/seller/cancel')
        .set('x-access-token', token2);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .put('/api/rental/seller/cancel')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(rental);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"Rental Canceled."}');
      done();
    });

    it('should respond to the PUT method with a 404', async (done) => {
      const response = await request(app)
        .put('/api/rental/seller/cancel')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(notRental);
      expect(response.text).toBe('{"message":"No rentals found"}');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the PUT method with a 400', async (done) => {
      const response = await request(app)
        .put('/api/rental/seller/cancel')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.text).toBe('{"message":"Provide a rentalId"}');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/rental/seller/cancel')
        .send(rental);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/rental/seller/cancel')
        .set('x-access-token', badToken)
        .send(rental);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/rental/seller/bookeddates', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      rentalId: 2,
    };

    const notRental = {
      rentalId: -2,
    };

    const nothing = {};

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/rental/seller/bookeddates')
        .set('x-access-token', token2);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/rental/seller/bookeddates?rentalId=${rental.rentalId}`)
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404', async (done) => {
      const response = await request(app)
        .get(`/api/rental/seller/bookeddates?rentalId=${notRental.rentalId}`)
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400', async (done) => {
      const response = await request(app)
        .get(`/api/rental/seller/bookeddates?${nothing}`)
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        `/api/rental/seller/bookeddates?rentalId=${rental.rentalId}`
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get(`/api/rental/seller/bookeddates?rentalId=${rental.rentalId}`)
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });
});
