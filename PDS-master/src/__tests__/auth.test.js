const request = require('supertest');
const nodemailer = require('nodemailer');
const app = require('../app');

const sendMailMock = jest.fn().mockReturnValue(true);
jest.mock('nodemailer');

nodemailer.createTransport.mockReturnValue({ sendEmail: sendMailMock });

describe('auth route tests', () => {
  let token;
  beforeAll(async (done) => {
    try {
      const response = await request(app).post('/api/auth/signin').send({
        username: 'admin1',
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
  // Sign Up Tests
  describe('/api/auth/signup', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const invalidemail = {
      username: 'randomuser',
      email: 'invalid@email',
      password: 'sOmething234',
    };

    const allroles = {
      username: 'randomuser',
      email: 'invalid@email',
      password: 'sOmething234',
      roles: ['admin', 'student', 'seller'],
    };

    const studentNoInfo = {
      username: 'randomuser',
      email: 'valid@email.com',
      password: 'sOmething234',
      roles: ['student'],
    };

    const student = {
      username: 'randomuser1',
      email: 'valid2@email.com',
      password: 'sOmething234',
      roles: ['student'],
      school_name: 'Instituto Politécnico do Cávado e do Ave',
      school_email: 'a42069@alunos.ipca.pt',
    };

    const sellerNoInfo = {
      username: 'randomuser2',
      email: 'valid3@email.com',
      password: 'sOmething234',
      roles: ['seller'],
    };

    const seller = {
      username: 'randomuser2',
      email: 'valid4@email2.com',
      password: 'sOmething234',
      roles: ['seller'],
      iban: 123456789,
    };

    const usernameTaken = {
      username: 'randomuser1',
      email: 'valid1@email.com',
      password: 'sOmething234',
      roles: ['seller'],
      iban: 123456789,
    };

    const emailTaken = {
      username: 'randomuser3',
      email: 'student1@localhost.local',
      password: 'sOmething234',
      roles: ['seller'],
      iban: 123456789,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).get('/api/auth/signup');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 500 for invalid email', async (done) => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(invalidemail);
      expect(response.statusCode).toBe(500);
      expect(response.text).toBe('{"message":"Error while trying to sign up"}');
      done();
    });

    it('should respond to the POST method with a 400 for cant add admin', async (done) => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(allroles);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        '{"message":"Only an admin can add more admins!"}'
      );
      done();
    });

    it('should respond to the POST method with a 400 for cant add student', async (done) => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(studentNoInfo);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Student details missing!"}');
      done();
    });

    it('should respond to the POST method with a 400 for cant add seller', async (done) => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(sellerNoInfo);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Seller details missing!"}');
      done();
    });

    it('should respond to the POST method with a 201 student added', async (done) => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(student);
      expect(response.statusCode).toBe(201);
      expect(response.text).toBe(
        '{"message":"User was registered successfully!"}'
      );
      done();
    });

    it('should respond to the POST method with a 201 for seller added', async (done) => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(seller);
      expect(response.statusCode).toBe(201);
      expect(response.text).toBe(
        '{"message":"User was registered successfully!"}'
      );
      done();
    });

    it('should respond to the POST method with a 200 for seller added', async (done) => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(usernameTaken);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        '{"message":"Failed! Username is already in use!"}'
      );
      done();
    });

    it('should respond to the POST method with a 400 for existing email', async (done) => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(emailTaken);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        '{"message":"Failed! Email is already in use!"}'
      );
      done();
    });
  });

  // Sign In Tests
  describe('/api/auth/signin', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const ghostuser = {
      username: 'testuser',
      password: 'sOmething234',
    };

    const user = {
      username: 'student1',
      password: 'TESTING1234',
    };

    const passwordInvalid = {
      username: 'user1',
      password: 'wrongPassword',
    };

    const nothing = {
      // username: 'user1',
      // password: 'wrongPassword',
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).get('/api/auth/signin');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 404 for a user that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/auth/signin')
        .set('Content-Type', 'application/json')
        .send(ghostuser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"User Not found."}');
      done();
    });

    it('should respond to the POST method with a 200 for logged in', async (done) => {
      const response = await request(app)
        .post('/api/auth/signin')
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 401 for invalid password', async (done) => {
      const response = await request(app)
        .post('/api/auth/signin')
        .set('Content-Type', 'application/json')
        .send(passwordInvalid);
      expect(response.statusCode).toBe(401);
      // expect(response.text).toBe('{"message":"Invalid Password!"}');
      done();
    });

    it('should respond to the POST method with a 500 for error while trying to sign in', async (done) => {
      const response = await request(app)
        .post('/api/auth/signin')
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(500);
      expect(response.text).toBe('{"message":"Internal Server Error"}');
      done();
    });
  });

  // Sign out Tests
  describe('/api/auth/signout', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).get('/api/auth/signout');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/auth/signout')
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 200 for signout success', async (done) => {
      const response = await request(app)
        .put('/api/auth/signout')
        .set('Content-Type', 'application/json')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"Signed Out Successfully"}');
      done();
    });

    const badToken = 1234;

    it('should respond to the POST method with a 401 for bad token, unauthorized', async (done) => {
      const response = await request(app)
        .put('/api/auth/signout')
        .set('Content-Type', 'application/json')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // Pw reset Tests
  describe('/api/auth/passwordreset/request', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
      // Mock nodemailer
      sendMailMock.mockClear();
      nodemailer.createTransport.mockClear();
    });

    const noEmail = {};

    const badEmail = {
      email: 'bad@email.com',
    };

    const email = {
      email: 'user1@localhost.local',
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).get(
        '/api/auth/passwordreset/request'
      );
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 400 for no email in request body', async (done) => {
      const response = await request(app)
        .post('/api/auth/passwordreset/request')
        .send(noEmail);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        '{"message":"An email address needs to be provided!"}'
      );
      done();
    });

    it('should respond to the POST method with a 202 for bad email but security', async (done) => {
      const response = await request(app)
        .post('/api/auth/passwordreset/request')
        .send(badEmail);
      expect(response.statusCode).toBe(202);
      expect(response.text).toBe(
        '{"message":"In case the email exists, a password reset link was sent."}'
      );
      done();
    });

    it('should respond to the POST method with a 202 reset password', async (done) => {
      const response = await request(app)
        .post('/api/auth/passwordreset/request')
        .send(email);
      expect(response.statusCode).toBe(202);
      expect(response.text).toBe(
        '{"message":"In case the email exists, a password reset link was sent."}'
      );
      done();
    });
  });

  // // Pw reset Tests
  // describe('/api/auth/passwordreset/:id/:token', () => {
  //   beforeEach(() => {
  //     // Avoid polluting the test output with 404 error messages
  //     jest.spyOn(console, 'error').mockImplementation(() => {});
  //   });

  //   const noUser = {};

  //   const badUser = {
  //     email: 'bad@email.com',
  //   };

  //   const user = {
  //     userId: 2,
  //   };

  //   it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
  //     const response = await request(app).post(
  //       '/api/auth/passwordreset/:id/:token'
  //     );
  //     expect(response.statusCode).toBe(404);
  //     expect(response.text).toBe('{"message":"Not Found"}');
  //     done();
  //   });

  //   it('should respond to the GET method with a ', async (done) => {
  //     const response = await request(app).get(
  //       `/api/auth/passwordreset/${user.userId}/${token}`
  //     );
  //     expect(response.statusCode).toBe(500);
  //     expect(response.text).toBe('{"message":"Not Found?"}');
  //     done();
  //   });
  // });

  // Pw reset Tests
  describe('/api/auth/passwordreset/set', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      userId: 3,
      password: 'newPassword5',
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).put('/api/auth/passwordreset/set');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a for missing pw request token', async (done) => {
      const response = await request(app)
        .post(`/api/auth/passwordreset/set`)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });
  });
});
