const request = require('supertest');
const app = require('../app');

describe('user route tests', () => {
  let token;
  let token2;
  let token3;
  const badToken = 1234;
  beforeAll(async (done) => {
    try {
      const response = await request(app).post('/api/auth/signin').send({
        username: 'User1',
        password: 'TESTING1234',
      });
      token = response.body.accessToken;
    } catch (err) {
      console.error(err);
    }
    try {
      const response2 = await request(app).post('/api/auth/signin').send({
        username: 'student1',
        password: 'TESTING1234',
      });
      token2 = response2.body.accessToken;
    } catch (err) {
      console.error(err);
    }
    try {
      const response3 = await request(app).post('/api/auth/signin').send({
        username: 'seller2',
        password: 'TESTING1234',
      });
      token3 = response3.body.accessToken;
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
  describe('/api/user/info/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/user/info/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .get('/api/user/info/get')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/user/info/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/user/info/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/user/info/setbasic', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      email: 'legit_email@yesyes.com',
      password: 'passwordlelele',
    };

    const invalidEmailOnly = {
      school_email: 'invalidEmail',
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).get('/api/user/info/setbasic');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/user/info/setbasic')
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/user/info/setbasic')
        .set('Content-Type', 'application/json')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });

    it('should respond to the PUT method with a 400 for invalid email', async (done) => {
      const response = await request(app)
        .put('/api/user/info/setbasic')
        .set('Content-Type', 'application/json')
        .set('x-access-token', token)
        .send(invalidEmailOnly);
      expect(response.statusCode).toBe(500);
      expect(response.text).toBe(
        '{"message":"Error updating user information"}'
      );
      done();
    });

    it('should respond to the PUT method with a 200 for user information updated', async (done) => {
      const response = await request(app)
        .put('/api/user/info/setbasic')
        .set('Content-Type', 'application/json')
        .set('x-access-token', token)
        .send(user);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe(
        '{"message":"User information updated successfully"}'
      );
      done();
    });
  });

  // PUT
  describe('/api/user/info/setextended', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      firstname: 'firstname',
      lastname: 'lastname',
      birthdate: new Date(1990, 11, 11),
      address: 'address',
      address2: 'address2',
      postcode: '43535',
      city: 'city',
      region: 'region',
      country: 'country',
    };

    const badUpdate = {
      birthdate: 'lol',
    };

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).get('/api/user/info/setextended');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 401 for a bad token', async (done) => {
      const response = await request(app)
        .put('/api/user/info/setextended')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });

    it('should respond to the PUT method with a 403 for no token', async (done) => {
      const response = await request(app).put('/api/user/info/setextended');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the PUT method with a 200 for user information updated', async (done) => {
      const response = await request(app)
        .put('/api/user/info/setextended')
        .set('x-access-token', token)
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 500 for Error updating user information', async (done) => {
      const response = await request(app)
        .put('/api/user/info/setextended')
        .set('x-access-token', token)
        .send(badUpdate);
      expect(response.statusCode).toBe(500);
      expect(response.text).toBe(
        '{"message":"Error updating user information"}'
      );
      done();
    });
  });

  // PUT
  describe('/api/user/roles/add', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const ghostStudent = {
      role: 'student',
      school_name: 'eepca',
      school_email: 'a69@alunos.ipca.pt',
    };

    const invalidRole = {
      role: 'invalid',
    };

    const noRole = {
      school_name: 'eepca',
      school_email: 'a69@alunos.ipca.pt',
    };

    const studentNoDetails = {
      role: 'student',
    };

    const sellerNoDetails = {
      role: 'seller',
    };
    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).get('/api/user/roles/addd');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 404 for a student ID that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/user/roles/add')
        .set('x-access-token', token)
        .send(ghostStudent);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 404 ', async (done) => {
      const response = await request(app)
        .post('/api/user/roles/add')
        .send(ghostStudent);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for role added', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/add')
        .set('x-access-token', token)
        .send(ghostStudent);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"Role added successfully!"}');
      done();
    });

    it('should respond to the PUT method with a 400 for Provide a role name', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/add')
        .set('x-access-token', token)
        .send(noRole);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a role name"}');
      done();
    });

    it('should respond to the PUT method with a 400 for You already have that role', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/add')
        .set('x-access-token', token2)
        .send(ghostStudent);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"You already have that role"}');
      done();
    });

    it('should respond to the PUT method with a 400 for Invalid Role', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/add')
        .set('x-access-token', token)
        .send(invalidRole);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Invalid Role"}');
      done();
    });

    it('should respond to the PUT method with a 400 for Student details missing!', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/add')
        .set('x-access-token', token)
        .send(studentNoDetails);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Student details missing!"}');
      done();
    });

    it('should respond to the PUT method with a 400 for Seller details missing!', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/add')
        .set('x-access-token', token)
        .send(sellerNoDetails);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Seller details missing!"}');
      done();
    });
  });

  // PUT
  describe('/api/user/roles/remove', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const ghostStudent = {
      role: 'student',
      school_name: 'eepca',
      school_email: 'a69@alunos.ipca.pt',
    };

    const invalidRole = {
      role: 'invalid',
    };

    const noRole = {
      school_name: 'eepca',
      school_email: 'a69@alunos.ipca.pt',
    };

    const roleStudent = {
      role: 'student',
    };

    const roleSeller = {
      role: 'seller',
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).get('/api/user/roles/addd');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 404 for a student ID that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/user/roles/remove')
        .set('x-access-token', token)
        .send(ghostStudent);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for role removed', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/remove')
        .set('x-access-token', token)
        .send(ghostStudent);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"Role removed successfully!"}');
      done();
    });

    it('should respond to the PUT method with a 400 for Provide a role name', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/remove')
        .set('x-access-token', token)
        .send(noRole);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a role name"}');
      done();
    });

    it('should respond to the PUT method with a 400 for You dont have that role', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/remove')
        .set('x-access-token', token2)
        .send(roleSeller);
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the PUT method with a 400 for You dont have that role', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/remove')
        .set('x-access-token', token3)
        .send(roleStudent);
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the PUT method with a 403 for You still have active rentals!', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/remove')
        .set('x-access-token', token2)
        .send(roleStudent);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe(
        '{"message":"You still have active rentals!"}'
      );
      done();
    });

    it('should respond to the PUT method with a 403 for You still have active rentals!', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/remove')
        .set('x-access-token', token3)
        .send(roleSeller);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe(
        '{"message":"You still have active rentals!"}'
      );
      done();
    });

    it('should respond to the PUT method with a 400 for Invalid Role', async (done) => {
      const response = await request(app)
        .put('/api/user/roles/remove')
        .set('x-access-token', token)
        .send(invalidRole);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Invalid Role"}');
      done();
    });
  });
});
