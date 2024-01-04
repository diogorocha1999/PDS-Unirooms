const request = require('supertest');
const app = require('../app');

describe('public route tests', () => {
  //   let token;
  //   beforeAll(async (done) => {
  //     try {
  //       const response = await request(app).post('/api/auth/signin').send({
  //         username: 'user1',
  //         password: 'TESTING1234',
  //       });
  //       token = response.body.accessToken;
  //     } catch (err) {
  //       console.error(err);
  //     }
  //     done();
  //   });
  afterAll(async (done) => {
    await app.close();

    done();
  });

  // GET
  describe('/api/public/user/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      userId: 2,
    };

    const notUser = {
      userId: -1,
    };

    const nothing = {};

    it('should respond to the POST method with a 200 for successfull get', async (done) => {
      const response = await request(app).get(
        `/api/public/user/get?userId=${user.userId}`
      );
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 404 for User not found', async (done) => {
      const response = await request(app).get(
        `/api/public/user/get?userId=${notUser.userId}`
      );
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"User not found"}');
      done();
    });

    it('should respond to the POST method with a 400 for Provide a userId', async (done) => {
      const response = await request(app).get(
        `/api/public/user/get?${nothing}`
      );
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a userId"}');
      done();
    });
  });

  // GET
  describe('/api/public/seller/get', () => {
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

    const nothing = {};

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app).get(
        `/api/public/seller/get?sellerId=${user.sellerId}`
      );
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 404 for Seller not found', async (done) => {
      const response = await request(app).get(
        `/api/public/seller/get?sellerId=${notUser.userId}`
      );
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Seller not found"}');
      done();
    });

    it('should respond to the POST method with a 400 for Provide a sellerId', async (done) => {
      const response = await request(app).get(
        `/api/public/seller/get?${nothing}`
      );
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a sellerId"}');
      done();
    });
  });

  // GET
  describe('/api/public/student/get', () => {
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

    const nothing = {};

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app).get(
        `/api/public/student/get?studentId=${user.studentId}`
      );
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 404 for student not found', async (done) => {
      const response = await request(app).get(
        `/api/public/student/get?studentId=${notUser.userId}`
      );
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Student not found"}');
      done();
    });

    it('should respond to the POST method with a 400 for Provide a studentId', async (done) => {
      const response = await request(app).get(
        `/api/public/student/get?${nothing}`
      );
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a studentId"}');
      done();
    });
  });

  // GET
  describe('/api/public/property/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      propertyId: 2,
    };

    const notUser = {
      propertyId: -1,
    };

    const nothing = {};

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app).get(
        `/api/public/property/get?propertyId=${user.propertyId}`
      );
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 404 for property not found', async (done) => {
      const response = await request(app).get(
        `/api/public/property/get?propertyId=${notUser.propertyId}`
      );
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe('{"message":"Property not found"}');
      done();
    });

    it('should respond to the POST method with a 400 for Provide a propertyId', async (done) => {
      const response = await request(app).get(
        `/api/public/property/get?${nothing}`
      );
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a propertyId"}');
      done();
    });
  });

  // GET
  describe('/api/public/property/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      sellerId: 3,
      city_id: 1,
    };

    const user2 = {
      sellerId: 2,
    };

    const nothing = {};

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app).get(
        `/api/public/property/list?city_id=${user.city_id}&sellerId=${user.sellerId}`
      );
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the POST method with a 400 for Provide a propertyId', async (done) => {
      const response = await request(app).get(
        `/api/public/property/get?${nothing}`
      );
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a propertyId"}');
      done();
    });

    it('should respond to the POST method with a 400 for Provide a propertyId', async (done) => {
      const response = await request(app).get(
        `/api/public/property/get?sellerId=${user2.sellerId}`
      );
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe('{"message":"Provide a propertyId"}');
      done();
    });
  });

  // GET
  describe('/api/public/room/list', () => {
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

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app).get(
        `/api/public/room/list?propertyId=${user.propertyId}`
      );
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404 for No property found', async (done) => {
      const response = await request(app).get(
        `/api/public/room/list?propertyId=${notUser.propertyId}`
      );
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400 for Provide a propertyId', async (done) => {
      const response = await request(app).get(
        `/api/public/room/list?${nothing}`
      );
      expect(response.statusCode).toBe(400);
      done();
    });
  });

  // GET
  describe('/api/public/room/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      roomId: 3,
    };

    const notUser = {
      roomId: -1,
    };

    const nothing = {};

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/public/room/get?roomId=${user.roomId}`)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404 for No property found', async (done) => {
      const response = await request(app).get(
        `/api/public/room/get?roomId=${notUser.roomId}`
      );
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400 for Provide a propertyId', async (done) => {
      const response = await request(app).get(
        `/api/public/room/get?${nothing}`
      );
      expect(response.statusCode).toBe(400);
      done();
    });
  });

  // GET
  describe('/api/public/room/bookinglist', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      from: new Date(),
      duration: 6,
      roomId: 3,
    };

    const incUser = {
      from: new Date(),
      duration: 6,
    };

    const timeMachine = {
      from: '2002-04-28 00:00:00',
      duration: 6,
      roomId: 3,
    };

    const userNoRoom = {
      from: new Date(),
      duration: 6,
      roomId: -3,
    };
    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(
          `/api/public/room/bookinglist?from=${user.from}&duration=${user.duration}&roomId=${user.roomId}`
        )
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 400 for Provide valid from date, duration in months, and a roomId', async (done) => {
      const response = await request(app)
        .get(
          `/api/public/room/bookinglist?from=${incUser.from}&duration=${incUser.duration}`
        )
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the GET method with a 400 for Invalid date', async (done) => {
      const response = await request(app)
        .get(
          `/api/public/room/bookinglist?from=${timeMachine.from}&duration=${timeMachine.duration}&roomId=${timeMachine.roomId}`
        )
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(400);
      done();
    });

    it('should respond to the GET method with a 404 for Room not found', async (done) => {
      const response = await request(app)
        .get(
          `/api/public/room/bookinglist?from=${userNoRoom.from}&duration=${userNoRoom.duration}&roomId=${userNoRoom.roomId}`
        )
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      done();
    });
  });

  // GET
  describe('/api/public/location/city/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      city_id: 1,
    };

    const notCity = {
      city_id: -1,
    };

    const nothing = {};

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/public/location/city/get?city_id=${user.city_id}`)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404 for City not found', async (done) => {
      const response = await request(app)
        .get(`/api/public/location/city/get?city_id=${notCity.city_id}`)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400 for Provide a city_id', async (done) => {
      const response = await request(app)
        .get(`/api/public/location/city/get?${nothing}`)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(400);
      done();
    });
  });

  // GET
  describe('/api/public/location/city/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      region_id: 1,
    };

    const notCity = {
      region_id: 999,
    };

    const nothing = {};

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app)
        .get(`/api/public/location/city/list?region_id=${user.region_id}`)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404 for Region not found', async (done) => {
      const response = await request(app)
        .get(`/api/public/location/city/list?region_id=${notCity.region_id}`)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400 for Provide a region_id', async (done) => {
      const response = await request(app)
        .get(`/api/public/location/city/list?${nothing}`)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(400);
      done();
    });
  });

  // GET
  describe('/api/public/location/region/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      region_id: 1,
    };

    const notCity = {
      region_id: 99999,
    };

    const nothing = {};

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app).get(
        `/api/public/location/region/get?region_id=${user.region_id}`
      );
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404 for Region not found', async (done) => {
      const response = await request(app)
        .get(`/api/public/location/city/list?region_id=${notCity.region_id}`)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400 for Provide a region_id', async (done) => {
      const response = await request(app)
        .get(`/api/public/location/city/list?${nothing}`)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(400);
      done();
    });
  });

  // GET
  describe('/api/public/location/region/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      country_id: 1,
    };

    const notCity = {
      country_id: 999999,
    };

    const nothing = {};

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app).get(
        `/api/public/location/region/list?country_id=${user.country_id}`
      );
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404 for Country not found', async (done) => {
      const response = await request(app)
        .get(
          `/api/public/location/region/list?country_id=${notCity.country_id}`
        )
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400 for Provide a country_id', async (done) => {
      const response = await request(app)
        .get(`/api/public/location/region/list?${nothing}`)
        .set('Content-Type', 'application/json');
      expect(response.statusCode).toBe(400);
      done();
    });
  });

  // GET
  describe('/api/public/location/country/get', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const user = {
      country_id: 1,
    };

    const notCity = {
      country_id: 99999,
    };

    const nothing = {};

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app).get(
        `/api/public/location/country/get?country_id=${user.country_id}`
      );
      expect(response.statusCode).toBe(200);
      done();
    });

    it('should respond to the GET method with a 404 for successfull get', async (done) => {
      const response = await request(app).get(
        `/api/public/location/country/get?country_id=${notCity.country_id}`
      );
      expect(response.statusCode).toBe(404);
      done();
    });

    it('should respond to the GET method with a 400 for successfull get', async (done) => {
      const response = await request(app).get(
        `/api/public/location/country/get?${nothing}`
      );
      expect(response.statusCode).toBe(400);
      done();
    });
  });

  // GET
  describe('/api/public/location/country/list', () => {
    beforeEach(() => {
      // Avoid polluting the test output with 404 error messages
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should respond to the GET method with a 200 for successfull get', async (done) => {
      const response = await request(app).get(
        '/api/public/location/country/list'
      );
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});
