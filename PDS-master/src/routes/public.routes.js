const controller = require('../controllers/public.controller');

module.exports = function setroutes(app) {
  app.use(function setheaders(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // User
  app.get(
    '/api/public/user/get',
    controller.userGet
    // #swagger.tags = ['Public']
  );

  // Seller
  app.get(
    '/api/public/seller/get',
    controller.getSeller
    // #swagger.tags = ['Public']
  );

  // Student
  app.get(
    '/api/public/student/get',
    controller.getStudent
    // #swagger.tags = ['Public']
  );

  // Property
  app.get(
    '/api/public/property/list',
    controller.propertyList
    // #swagger.tags = ['Public']
  );
  app.get(
    '/api/public/property/get',
    controller.getProperty
    // #swagger.tags = ['Public']
  );

  // Room
  app.get(
    '/api/public/room/list',
    controller.roomList
    // #swagger.tags = ['Public']
  );
  app.get(
    '/api/public/room/get',
    controller.getRoom
    // #swagger.tags = ['Public']
  );
  app.get(
    '/api/public/room/bookinglist',
    controller.bookingList
    // #swagger.tags = ['Public']
  );

  // Location
  app.get(
    '/api/public/location/city/get',
    controller.getCity
    // #swagger.tags = ['Public']
  );
  app.get(
    '/api/public/location/city/list',
    controller.cityList
    // #swagger.tags = ['Public']
  );
  app.get(
    '/api/public/location/region/get',
    controller.getRegion
    // #swagger.tags = ['Public']
  );
  app.get(
    '/api/public/location/region/list',
    controller.regionList
    // #swagger.tags = ['Public']
  );
  app.get(
    '/api/public/location/country/get',
    controller.getCountry
    // #swagger.tags = ['Public']
  );
  app.get(
    '/api/public/location/country/list',
    controller.countryList
    // #swagger.tags = ['Public']
  );
};
