const request = require('supertest');
const app = require('../app');

// jest.mock('/api/auth/signup',() => (req: Request, res:Response, next: NextFunction))

let token;
let token2;
const badToken = 1234;
describe('payment route tests', () => {
  beforeAll(async (done) => {
    try {
      const response = await request(app).post('/api/auth/signin').send({
        username: 'seller1',
        password: 'TESTING1234',
      });
      token = response.body.accessToken;

      const response2 = await request(app).post('/api/auth/signin').send({
        username: 'student1',
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
  // Create payment tests
  describe('/api/payment/student/pay', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const payment = {
      card_number: 4916396377559858,
      card_owner: 'ooga booga',
      payType: 3,
      ccv: 123,
      amount: 123,
      rentalId: 1,
    };

    const invalidPayment = {
      card_number: 4916396377559858,
      card_owner: 'ooga booga',
      payType: 0,
      ccv: 123,
      amount: 123,
      rentalId: 1,
    };

    const invalidPayment2 = {
      card_number: 4916396377559858,
      card_owner: 'ooga booga',
      payType: 0,
      ccv: 123,
      amount: 123,
      rentalId: -2,
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/payment/student/pay')
        .set('x-access-token', token2);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 201 for successfull payment creation', async (done) => {
      const response = await request(app)
        .post('/api/payment/student/pay')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(payment);
      expect(response.statusCode).toBe(201);
      done();
    });

    it('should respond to the POST method with a 400 for invalid operation', async (done) => {
      const response = await request(app)
        .post('/api/payment/student/pay')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(invalidPayment);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Invalid operation"}');
      done();
    });

    it('should respond to the POST method with a 400 for rental not found', async (done) => {
      const response = await request(app)
        .post('/api/payment/student/pay')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(invalidPayment2);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Rental not found"}');
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .post('/api/payment/student/pay')
        .send(payment);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .post('/api/payment/student/pay')
        .set('x-access-token', badToken)
        .send(payment);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/payment/student/confirm', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const paymentId = {
      paymentId: 4,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .get('/api/payment/student/confirm')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    // it('should respond to the PUT method with a 404 for invalid user id (not found)', async (done) => {
    //   const response = await request(app)
    //     .put('/api/payment/student/confirm')
    //     .set('x-access-token', token)
    //     .set('Content-Type', 'application/json')
    //     .send(notUser);
    //   expect(response.statusCode).toBe(404);
    //   expect(response.text).toBe(
    //     '{"message":"No user with that Id was found"}'
    //   );
    // });

    it('should respond to the PUT method with a 200 for successful confirm', async (done) => {
      const response = await request(app)
        .put('/api/payment/student/confirm')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(paymentId);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"Payment Confirmed."}');
      done();
    });

    it('should respond to the PUT method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/payment/student/confirm')
        .send(paymentId);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/payment/student/confirm')
        .set('x-access-token', badToken)
        .send(paymentId);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/payment/student/void', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const paymentId = {
      paymentId: 3,
    };

    const validatedPaymentId = {
      paymentId: 1,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .get('/api/payment/student/void')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull confirm', async (done) => {
      const response = await request(app)
        .put('/api/payment/student/void')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(paymentId);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"Payment voided."}');
      done();
    });

    it('should respond to the GET method with a 400 for Error: This payment was already processed', async (done) => {
      const response = await request(app)
        .put('/api/payment/student/void')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(validatedPaymentId);
      expect(response.text).toBe(
        '{"message":"Error: This payment was already processed"}'
      );
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the PUT method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/payment/student/void')
        .send(paymentId);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/payment/student/void')
        .set('x-access-token', badToken)
        .send(paymentId);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/payment/student/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      rentalId: 2,
    };

    const ghostRental = {
      rentalId: -2,
    };

    const nothing = {};

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/payment/student/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/payment/student/list?rentalId=${rental.rentalId}`)
        .set('x-access-token', token2);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404 for rental not found', async (done) => {
      const response = await request(app)
        .get(`/api/payment/student/list?rentalId=${ghostRental.rentalId}`)
        .set('x-access-token', token2);
      expect(response.text).toBe('{"message":"Rental not found"}');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400 for invalid rental id', async (done) => {
      const response = await request(app)
        .get(`/api/payment/student/list?${nothing}`)
        .set('x-access-token', token2);
      expect(response.text).toBe('{"message":"Provide a valid rentalId"}');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        `/api/payment/student/list?rentalId=${rental.rentalId}`
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get(`/api/payment/student/list?rentalId=${rental.rentalId}`)
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/payment/seller/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const rental = {
      rentalId: 2,
    };

    const ghostRental = {
      rentalId: -2,
    };

    const nothing = {};

    it('should respond to the `PUT` method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/payment/seller/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/payment/seller/list?rentalId=${rental.rentalId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404 for Rental not found', async (done) => {
      const response = await request(app)
        .get(`/api/payment/seller/list?rentalId=${ghostRental.rentalId}`)
        .set('x-access-token', token);
      expect(response.text).toBe('{"message":"Rental not found"}');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400 for invalid rentalId', async (done) => {
      const response = await request(app)
        .get(`/api/payment/seller/list?${nothing}`)
        .set('x-access-token', token);
      expect(response.text).toBe('{"message":"Provide a valid rentalId"}');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        `/api/payment/seller/list?rentalId=${rental.rentalId}`
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get(`/api/payment/seller/list?rentalId=${rental.rentalId}`)
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });
});
