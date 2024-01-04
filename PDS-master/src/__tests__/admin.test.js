// Administration Tests)
const request = require('supertest');
const app = require('../app');

describe('admin route tests', () => {
  let token;
  const badToken = 1234;
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

  /* --------------------------------------------------------------------------------- */
  /* ------------------------------------USER----------------------------------------- */
  /* --------------------------------------------------------------------------------- */

  // GET
  describe('/api/admin/user/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      userId: 1,
    };

    const notUser = {
      userId: -1,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/user/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .get(`/api/admin/user/get?userId=${notUser.userId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"No user was found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .get(`/api/admin/user/get?userId=${user.userId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/user/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/user/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/admin/user/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/user/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .get('/api/admin/user/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/user/list');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/user/list')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/admin/user/enable', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      userId: 1,
    };

    const notUser = {
      userId: -1,
    };

    const nothing = {};

    const string = {
      userId: '1',
    };

    const string2 = {
      nothing: 'nothing',
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/user/enable')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/enable')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/enable')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"User enabled"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No user with that Id was found"}'
      );
      done();
    });

    it('should respond to the PUT method with a 400 for invalid user id ', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(string2);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid userId"}');
      done();
    });

    it('should respond to the PUT method with a 400 for invalid user id ', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid userId"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(string);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"User enabled"}');
      done();
    });
  });

  // PUT
  describe('/api/admin/user/disable', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      userId: 8,
    };

    const notUser = {
      userId: -1,
    };

    const nothing = {};

    const string = {
      userId: '1',
    };

    const string2 = {
      nothing: 'nothing',
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/user/disable')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No user with that Id was found"}'
      );
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/disable')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/disable')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });

    it('should respond to the PUT method with a 400 for invalid user id ', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(string2);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid userId"}');
      done();
    });

    it('should respond to the PUT method with a 400 for invalid user id ', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid userId"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(string);
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('{"message":"User disabled"}');
      done();
    });
  });

  // DELETE
  describe('/api/admin/user/delete', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      userId: 10,
    };

    const notUser = {
      userId: -1,
    };

    const nothing = {};

    const string2 = {
      nothing: 'nothing',
    };

    it('should respond to the delete method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/user/delete')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the delete method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .delete('/api/admin/user/delete')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No user with that Id was found"}'
      );
      done();
    });

    it('should respond to the delete method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .delete('/api/admin/user/delete')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the delete method with a 403 for no token', async (done) => {
      const response = await request(app)
        .delete('/api/admin/user/delete')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the delete method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .delete('/api/admin/user/delete')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });

    it('should respond to the delete method with a 400 for invalid user id ', async (done) => {
      const response = await request(app)
        .delete('/api/admin/user/delete')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(string2);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid userId"}');
      done();
    });

    it('should respond to the delete method with a 400 for invalid user id ', async (done) => {
      const response = await request(app)
        .delete('/api/admin/user/delete')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid userId"}');
      done();
    });
  });

  // PUT
  describe('/api/admin/user/addrole', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const seller = {
      userId: 2,
      role: 'seller',
      iban: 'PT50 0000 0000 038943244 83248943 2',
    };

    const student = {
      userId: 3,
      role: 'student',
      school_name: 'ipca',
      school_email: 'pep.talk@wow.com',
    };

    const studentDetailsMissing = {
      userId: 3,
      role: 'student',
    };

    const notUser = {
      userId: -1,
      role: 'seller',
    };

    const notUserNoRole = {
      userId: -1,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/user/addrole')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/addrole')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Seller details missing!"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/addrole')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUserNoRole);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a role name"}');
      done();
    });

    it('should respond to the PUT method with a 400 for missing request data', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/addrole')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(studentDetailsMissing);
      expect(response.text).toBe('{"message":"Student details missing!"}');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the PUT method with a 200 for successfull role adding', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/addrole')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(student);
      expect(response.text).toBe('{"message":"Role added successfully!"}');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the PUT method with a 200 for successfull role adding', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/addrole')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(seller);
      expect(response.text).toBe('{"message":"Role added successfully!"}');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/addrole')
        .send(student);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/addrole')
        .set('x-access-token', badToken)
        .send(student);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/admin/user/removerole', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      userId: 3,
      role: 'student',
    };

    const user2 = {
      userId: 2,
      role: 'seller',
    };

    const notUser = {
      userId: -1,
    };

    const notUserWithRole = {
      userId: -1,
      role: 'seller',
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/user/removerole')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/removerole')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a role name"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/removerole')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUserWithRole);
      expect(response.statusCode).toBe(500);
      expect(response.text).toBe('{"message":"Error removing role"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid user id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/removerole')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user2);
      expect(response.statusCode).toBe(500);
      expect(response.text).toBe('{"message":"Error removing role"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull update', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/removerole')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.text).toBe('{"message":"Role removed successfully!"}');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/removerole')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/admin/user/removerole')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });
  /* --------------------------------------------------------------------------------- */
  /* ------------------------------------SELLER--------------------------------------- */
  /* --------------------------------------------------------------------------------- */

  // GET
  describe('/api/admin/seller/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      sellerId: 1,
    };

    const notUser = {
      sellerId: -1,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/seller/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 404 for invalid seller id (not found)', async (done) => {
      const response = await request(app)
        .get(`/api/admin/seller/get?sellerId=${notUser.sellerId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"No seller was found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/admin/seller/get?sellerId=${user.sellerId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/seller/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/seller/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/admin/seller/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/seller/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull listing', async (done) => {
      const response = await request(app)
        .get('/api/admin/seller/list')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/seller/list');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/seller/list')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // // PUT
  // describe('/api/admin/seller/enable', () => {
  //   beforeEach(() => {
  //     // Avoid polluting the test output with 404 error messages
  //     jest.spyOn(console, 'error').mockImplementation(() => {});
  //   });

  //   const user = {
  //     sellerId: 1,
  //   };

  //   const notUser = {
  //     sellerId: -1,
  //   };

  //   it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
  //     const response = await request(app)
  //       .post('/api/admin/seller/enable')
  //       .set('x-access-token', token);
  //     expect(response.statusCode).toBe(404);
  //     expect(response.text).toBe('{"message":"Not Found"}');
  //   });

  //   it('should respond to the PUT method with a 404 for invalid seller id (not found)', async (done) => {
  //     const response = await request(app)
  //       .put('/api/admin/seller/enable')
  //       .set('x-access-token', token)
  //       .set('Content-Type', 'application/json')
  //       .send(notUser);
  //     expect(response.statusCode).toBe(404);
  //     expect(response.text).toBe(
  //       '{"message":"No seller with that Id was found"}'
  //     );
  //   });

  //   it('should respond to the PUT method with a 200 for successfull get', async (done) => {
  //     const response = await request(app)
  //       .put('/api/admin/seller/enable')
  //       .set('x-access-token', token)
  //       .set('Content-Type', 'application/json')
  //       .send(user);
  //     expect(response.statusCode).toBe(200);
  //   });

  //   it('should respond to the POST method with a 403 for no token', async (done) => {
  //     const response = await request(app)
  //       .put('/api/admin/seller/enable')
  //       .send(user);
  //     expect(response.statusCode).toBe(403);
  //     expect(response.text).toBe('{"message":"No token provided!"}');
  //   });

  //   it('should respond to the POST method with a 401 for bad token', async (done) => {
  //     const response = await request(app)
  //       .put('/api/admin/seller/enable')
  //       .set('x-access-token', badToken)
  //       .send(user);
  //     expect(response.statusCode).toBe(401);
  //     expect(response.text).toBe('{"message":"Unauthorized!"}');
  //   });
  // });

  // // PUT
  // describe('/api/admin/seller/disable', () => {
  //   beforeEach(() => {
  //     // Avoid polluting the test output with 404 error messages
  //     jest.spyOn(console, 'error').mockImplementation(() => {});
  //   });

  //   const user = {
  //     sellerId: 1,
  //   };

  //   const notUser = {
  //     sellerId: -1,
  //   };

  //   it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
  //     const response = await request(app)
  //       .post('/api/admin/seller/disable')
  //       .set('x-access-token', token);
  //     expect(response.statusCode).toBe(404);
  //     expect(response.text).toBe('{"message":"Not Found"}');
  //   });

  //   it('should respond to the PUT method with a 404 for invalid seller id (not found)', async (done) => {
  //     const response = await request(app)
  //       .put('/api/admin/seller/disable')
  //       .set('x-access-token', token)
  //       .set('Content-Type', 'application/json')
  //       .send(notUser);
  //     expect(response.statusCode).toBe(404);
  //     expect(response.text).toBe(
  //       '{"message":"No seller with that Id was found"}'
  //     );
  //   });

  //   it('should respond to the PUT method with a 200 for successfull get', async (done) => {
  //     const response = await request(app)
  //       .put('/api/admin/seller/disable')
  //       .set('x-access-token', token)
  //       .set('Content-Type', 'application/json')
  //       .send(user);
  //     expect(response.statusCode).toBe(200);
  //   });

  //   it('should respond to the POST method with a 403 for no token', async (done) => {
  //     const response = await request(app)
  //       .put('/api/admin/seller/disable')
  //       .send(user);
  //     expect(response.statusCode).toBe(403);
  //     expect(response.text).toBe('{"message":"No token provided!"}');
  //   });

  //   it('should respond to the POST method with a 401 for bad token', async (done) => {
  //     const response = await request(app)
  //       .put('/api/admin/seller/disable')
  //       .set('x-access-token', badToken)
  //       .send(user);
  //     expect(response.statusCode).toBe(401);
  //     expect(response.text).toBe('{"message":"Unauthorized!"}');
  //   });
  // });

  /* --------------------------------------------------------------------------------- */
  /* --------------------------------DELEGATIONS-------------------------------------- */
  /* --------------------------------------------------------------------------------- */

  // GET
  describe('/api/admin/delegation/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      delegationId: 1,
    };

    const notUser = {
      delegationId: -1,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/delegation/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 404 for invalid delegation id (not found)', async (done) => {
      const response = await request(app)
        .get(`/api/admin/delegation/get?delegationId=${notUser.delegationId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"No delegation was found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/admin/delegation/get?delegationId=${user.delegationId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/delegation/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/delegation/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/admin/delegation/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/delegation/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get('/api/admin/delegation/list')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/delegation/list');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/delegation/list')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  /* --------------------------------------------------------------------------------- */
  /* ------------------------------------PROPERTIES----------------------------------- */
  /* --------------------------------------------------------------------------------- */

  // GET
  describe('/api/admin/property/get', () => {
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

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/property/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid property id (not found)', async (done) => {
      const response = await request(app)
        .get(`/api/admin/property/get?propertyId=${notUser.propertyId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No property with that Id found"}'
      );
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/admin/property/get?propertyId=${user.propertyId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/property/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/property/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/admin/property/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      sellerId: 3,
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/property/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/admin/property/list?sellerId=${user.sellerId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/property/list');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/property/list')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/admin/property/enable', () => {
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

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/property/enable')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid property id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/property/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No property with that Id was found"}'
      );
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .put('/api/admin/property/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/admin/property/enable')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/admin/property/enable')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/admin/property/disable', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      propertyId: 4,
    };

    const notUser = {
      propertyId: -1,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/property/disable')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid property id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/property/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No property with that Id was found"}'
      );
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .put('/api/admin/property/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/admin/property/disable')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/admin/property/disable')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  /* --------------------------------------------------------------------------------- */
  /* ------------------------------------ROOMS---------------------------------------- */
  /* --------------------------------------------------------------------------------- */

  // GET
  describe('/api/admin/room/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      roomId: 1,
    };

    const notUser = {
      roomId: -1,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/room/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid room id (not found)', async (done) => {
      const response = await request(app)
        .get(`/api/admin/room/get?roomId=${notUser.roomId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"No room with that Id found"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/admin/room/get?roomId=${user.roomId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/room/get').send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/room/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/admin/room/enable', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      roomId: 1,
    };

    const notUser = {
      roomId: -1,
    };

    const nothing = {};

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/room/enable')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid room id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/room/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No room with that Id was found"}'
      );
      done();
    });

    it('should respond to the PUT method with a 404 for invalid room id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/room/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid roomId"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .put('/api/admin/room/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/admin/room/enable')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/admin/room/enable')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/admin/room/disable', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      roomId: 1,
    };

    const notUser = {
      roomId: -1,
    };

    const nothing = {};

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/room/disable')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid room id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/room/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No room with that Id was found"}'
      );
      done();
    });

    it('should respond to the PUT method with a 404 for invalid room id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/room/enable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid roomId"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .put('/api/admin/room/disable')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/admin/room/disable')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/admin/room/disable')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  /* --------------------------------------------------------------------------------- */
  /* ------------------------------------STUDENTS------------------------------------- */
  /* --------------------------------------------------------------------------------- */

  // GET
  describe('/api/admin/student/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      studentId: 1,
    };

    const notUser = {
      studentId: -1,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/student/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 404 for invalid student id (not found)', async (done) => {
      const response = await request(app)
        .get(`/api/admin/student/get?studentId=${notUser.studentId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"No student was found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/admin/student/get?studentId=${user.studentId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/student/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/student/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/admin/student/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/student/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get('/api/admin/student/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/student/list');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/student/list')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  /* --------------------------------------------------------------------------------- */
  /* -------------------------------------RENTALS------------------------------------- */
  /* --------------------------------------------------------------------------------- */

  // GET
  describe('/api/admin/rental/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      rentalId: 1,
    };

    const notUser = {
      rentalId: -1,
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/rental/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 404 for invalid rental id (not found)', async (done) => {
      const response = await request(app)
        .get(`/api/admin/rental/get?rentalId=${notUser.rentalId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"No rental with that Id found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/admin/rental/get?rentalId=${user.rentalId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/rental/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/rental/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/admin/rental/cancel', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      rentalId: 3,
    };

    const notUser = {
      rentalId: -1,
    };

    const nothing = {};

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/rental/cancel')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid rental id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/rental/cancel')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No rental with that Id was found"}'
      );
      done();
    });

    it('should respond to the PUT method with a 404 for invalid rental id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/rental/cancel')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid rentalId"}');
      done();
    });

    it('should respond to the PUT method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .put('/api/admin/rental/cancel')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/admin/rental/cancel')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/admin/rental/cancel')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  /* --------------------------------------------------------------------------------- */
  /* ------------------------------------PAYMENTS------------------------------------- */
  /* --------------------------------------------------------------------------------- */

  // GET
  describe('/api/admin/payment/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      paymentId: 1,
    };

    const notUser = {
      paymentId: -1,
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/payment/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 404 for invalid payment id (not found)', async (done) => {
      const response = await request(app)
        .get(`/api/admin/payment/get?paymentId=${notUser.paymentId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"No payment with that Id found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/admin/payment/get?paymentId=${user.paymentId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/payment/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/payment/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/admin/payment/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/payment/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get('/api/admin/payment/list')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/admin/payment/list');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/admin/payment/list')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/admin/payment/validate', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      paymentId: 1,
    };

    const notUser = {
      paymentId: -1,
    };

    const nothing = {};

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/payment/validate')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid payment id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/payment/validate')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No payment with that Id was found"}'
      );
      done();
    });

    it('should respond to the PUT method with a 404 for invalid payment id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/payment/validate')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid paymentId"}');
      done();
    });

    // Need to create payments
    // it('should respond to the PUT method with a 200 for successfull get', async (done) => {
    //   const response = await request(app)
    //     .put('/api/admin/payment/validate')
    //     .set('x-access-token', token)
    //     .set('Content-Type', 'application/json')
    //     .send(user);
    //   expect(response.statusCode).toBe(200);
    // });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/admin/payment/validate')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/admin/payment/validate')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/admin/payment/void', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      paymentId: 1,
    };

    const notUser = {
      paymentId: -1,
    };

    const nothing = {};

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/admin/payment/void')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid payment id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/payment/void')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No payment with that Id was found"}'
      );
      done();
    });

    it('should respond to the PUT method with a 404 for invalid payment id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/admin/payment/void')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(nothing);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid paymentId"}');
      done();
    });

    // Need to create payments
    // it('should respond to the PUT method with a 200 for successfull get', async (done) => {
    //   const response = await request(app)
    //     .put('/api/admin/payment/void')
    //     .set('x-access-token', token)
    //     .set('Content-Type', 'application/json')
    //     .send(user);
    //   expect(response.statusCode).toBe(200);
    // });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/admin/payment/void')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/admin/payment/void')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  /* --------------------------------------------------------------------------------- */
  /* --------------------------------SELLER PAYOUTS----------------------------------- */
  /* --------------------------------------------------------------------------------- */

  // GET
  describe('/api/system/payout/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      payoutId: 1,
    };

    const notUser = {
      payoutId: -1,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/system/payout/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 404 for invalid payout id (not found)', async (done) => {
      const response = await request(app)
        .get(`/api/system/payout/get?payoutId=${notUser.payoutId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No Payout with that Id was found"}'
      );
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/system/payout/get?payoutId=${user.payoutId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/system/payout/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/system/payout/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/system/payout/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      from: '2022-04-28 00:00:00',
      to: '2022-06-29 00:00:00',
      status: 1,
    };

    const notUser = {
      from: 1,
      status: 0,
    };

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/system/payout/list')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 400 for invalid data', async (done) => {
      const response = await request(app)
        .get(
          `/api/system/payout/list?from=${notUser.from}&to=${notUser.status}`
        )
        .set('x-access-token', token);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        '{"message":"Provide valid from and to dates, and status"}'
      );
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(
          `/api/system/payout/list?from=${user.from}&to=${user.to}&status=${user.status}`
        )
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/system/payout/list');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/system/payout/list')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/system/payout/validate', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      payoutId: 1,
    };

    const notUser = {
      payoutId: -1,
    };

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/system/payout/validate')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid payout id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/system/payout/validate')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No Payout with that Id was found"}'
      );
      done();
    });

    // Need to create payouts
    // it('should respond to the PUT method with a 200 for successfull get', async (done) => {
    //   const response = await request(app)
    //     .put('/api/system/payout/validate')
    //     .set('x-access-token', token)
    //     .set('Content-Type', 'application/json')
    //     .send(user);
    //   expect(response.statusCode).toBe(200);
    // });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/system/payout/validate')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/system/payout/validate')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/system/payout/void', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      payoutId: 1,
    };

    const notUser = {
      payoutId: -1,
    };

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/system/payout/void')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid payout id (not found)', async (done) => {
      const response = await request(app)
        .put('/api/system/payout/void')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe(
        '{"message":"No Payout with that Id was found"}'
      );
      done();
    });

    // Need to create payouts
    // it('should respond to the PUT method with a 200 for successfull get', async (done) => {
    //   const response = await request(app)
    //     .put('/api/system/payout/void')
    //     .set('x-access-token', token)
    //     .set('Content-Type', 'application/json')
    //     .send(user);
    //   expect(response.statusCode).toBe(200);
    // });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/system/payout/void')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/system/payout/void')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  /* --------------------------------------------------------------------------------- */
  /* -------------------------------SYSTEM SETTINGS----------------------------------- */
  /* --------------------------------------------------------------------------------- */

  // GET
  describe('/api/system/settings/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/system/settings/get')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/system/settings/get');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/system/settings/get')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // PUT
  describe('/api/system/settings/update', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      transactionFee: 10,
      depositFee: 10,
      depositTimeLimit: 172800,
    };

    const notUser = {
      transactionFee: -1,
      depositFee: -1,
      depositTimeLimit: -1,
    };

    it('should respond to the PUT method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/system/settings/update')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the PUT method with a 404 for invalid body parameters (not found)', async (done) => {
      const response = await request(app)
        .put('/api/system/settings/update')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(notUser);
      expect(response.statusCode).toBe(500);
      done();
    });

    it('should respond to the PUT method with a 200 for successfull put', async (done) => {
      const response = await request(app)
        .put('/api/system/settings/update')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(user);
      expect(response.statusCode).toBe(204);
      done();
    });

    it('should respond to the PUT method with a 403 for no token', async (done) => {
      const response = await request(app)
        .put('/api/system/settings/update')
        .send(user);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .put('/api/system/settings/update')
        .set('x-access-token', badToken)
        .send(user);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });
});
