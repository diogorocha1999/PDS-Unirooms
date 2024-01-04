const request = require('supertest');
const app = require('../app');

describe('messaging route tests', () => {
  let token;
  let token2;
  let token3;
  const badToken = 1234;
  beforeAll(async (done) => {
    try {
      const response = await request(app).post('/api/auth/signin').send({
        username: 'seller2',
        password: 'TESTING1234',
      });
      token = response.body.accessToken;

      const response2 = await request(app).post('/api/auth/signin').send({
        username: 'student1',
        password: 'TESTING1234',
      });
      token2 = response2.body.accessToken;

      const response3 = await request(app).post('/api/auth/signin').send({
        username: 'student2',
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
  describe('/api/messaging/conversationlist', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/messaging/conversationlist')
        .set('x-access-token', token2);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/messaging/conversationlist`)
        .set('x-access-token', token2);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        '/api/messaging/conversationlist'
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/messaging/conversationlist')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/messaging/messagelist', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app).post('/api/messaging/messagelist');
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successful retrieval', async (done) => {
      const response = await request(app)
        .get(`/api/messaging/messagelist`)
        .set('x-access-token', token2);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 400 for no messages', async (done) => {
      const response = await request(app)
        .get('/api/messaging/messagelist')
        .set('x-access-token', token3);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"No messages found"}');
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/messaging/messagelist');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/messaging/messagelist')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/messaging/conversation', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const conversation = {
      conversationId: 1,
    };

    const notConversation = {
      conversationId: -1,
    };

    const nothing = {};

    it('should respond to the GET method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/messaging/conversation')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(
          `/api/messaging/conversation?conversationId=${conversation.conversationId}`
        )
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404 for conversation not found', async (done) => {
      const response = await request(app)
        .get(
          `/api/messaging/conversation?conversationId=${notConversation.conversationId}`
        )
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Conversation not found"}');
      done();
    });

    it('should respond to the GET method with a 400 for missing request data', async (done) => {
      const response = await request(app)
        .get(`/api/messaging/conversation?${nothing}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a conversationId"}');
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get('/api/messaging/conversation');
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/messaging/conversation')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // POST
  describe('/api/messaging/new', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const message = {
      subject: 'subject in a message? meh',
      content: 'asdasdfsdfsadf',
      recipientId: 2,
      roomId: 1,
    };

    const incompleteMessage = {
      content: 'asdasdfsdfsadf',
      recipientId: 2,
      roomId: 1,
    };

    const selfMessage = {
      subject: 'subject in a message? meh',
      content: 'asdasdfsdfsadf',
      recipientId: 5,
      roomId: 1,
    };

    const sysMessage = {
      subject: 'subject in a message? meh',
      content: 'asdasdfsdfsadf',
      recipientId: 1,
      roomId: 1,
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/messaging/new')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 201 for successfull message', async (done) => {
      const response = await request(app)
        .post('/api/messaging/new')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(message);
      expect(response.statusCode).toBe(201);
      done();
    });

    it('should respond to the POST method with a 400 for incomplete body', async (done) => {
      const response = await request(app)
        .post('/api/messaging/new')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(incompleteMessage);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        '{"message":"Provide a subject, content and recipientId"}'
      );
      done();
    });

    it('should respond to the POST method with a 400 for incomplete body', async (done) => {
      const response = await request(app)
        .post('/api/messaging/new')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(sysMessage);
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the POST method with a 400 for messaging yourself', async (done) => {
      const response = await request(app)
        .post('/api/messaging/new')
        .set('x-access-token', token)
        .set('Content-Type', 'application/json')
        .send(selfMessage);
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .post('/api/messaging/new')
        .send(message);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .post('/api/messaging/new')
        .set('x-access-token', badToken)
        .send(message);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  describe('/api/messaging/reply', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const message = {
      content: 'asdasdfsdfsadf',
      receiverId: 2,
      conversationId: 1,
    };

    const incMessage = {
      receiverId: 2,
      conversationId: 1,
    };

    const sysMessage = {
      content: 'asdasdfsdfsadf',
      receiverId: 1,
      conversationId: 1,
    };

    const ghostMessage = {
      content: 'asdasdfsdfsadf',
      receiverId: 2,
      conversationId: -1,
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .put('/api/messaging/reply')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the POST method with a 201 for successfull message', async (done) => {
      const response = await request(app)
        .post('/api/messaging/reply')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(message);
      expect(response.statusCode).toBe(201);
      done();
    });

    it('should respond to the POST method with a 400 for incomplete request', async (done) => {
      const response = await request(app)
        .post('/api/messaging/reply')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(incMessage);
      expect(response.text).toBe(
        '{"message":"Provide a subject, content and receiverId"}'
      );
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the POST method with a 400 for conversation doesnt exist', async (done) => {
      const response = await request(app)
        .post('/api/messaging/reply')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(ghostMessage);
      expect(response.text).toBe('{"message":"Conversation not found"}');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the POST method with a 400 for messging system', async (done) => {
      const response = await request(app)
        .post('/api/messaging/reply')
        .set('x-access-token', token2)
        .set('Content-Type', 'application/json')
        .send(sysMessage);
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the POST method with a 403 for no token', async (done) => {
      const response = await request(app)
        .post('/api/messaging/reply')
        .send(message);
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the POST method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .post('/api/messaging/reply')
        .set('x-access-token', badToken)
        .send(message);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });

  // GET
  describe('/api/messaging/roomconversations', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const room = {
      roomId: 3,
    };

    const room2 = {
      roomId: 2,
    };

    it('should respond to the POST method with a 404 for a route that does not exist', async (done) => {
      const response = await request(app)
        .post('/api/messaging/roomconversations')
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Not Found"}');
      done();
    });

    it('should respond to the GET method with a 404 for no conversations found', async (done) => {
      const response = await request(app)
        .get(`/api/messaging/roomconversations?roomId=${room2.roomId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"No conversations found"}');
      done();
    });

    it('should respond to the GET method with a 400 for missing request data', async (done) => {
      const response = await request(app)
        .get(`/api/messaging/roomconversations`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a valid roomId"}');
      done();
    });

    it('should respond to the GET method with a 403 for no access to room', async (done) => {
      const response = await request(app)
        .get(`/api/messaging/roomconversations?roomId=${room.roomId}`)
        .set('x-access-token', token3);
      expect(response.statusCode).toBe(403);
      done();
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/messaging/roomconversations?roomId=${room.roomId}`)
        .set('x-access-token', token);
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 403 for no token', async (done) => {
      const response = await request(app).get(
        '/api/messaging/roomconversations'
      );
      expect(response.statusCode).toBe(403);
      expect(response.text).toBe('{"message":"No token provided!"}');
      done();
    });

    it('should respond to the GET method with a 401 for bad token', async (done) => {
      const response = await request(app)
        .get('/api/messaging/roomconversations')
        .set('x-access-token', badToken);
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe('{"message":"Unauthorized!"}');
      done();
    });
  });
});
