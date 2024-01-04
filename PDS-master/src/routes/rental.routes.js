// const app = require('../app');
const controller = require('../controllers/rental.controller');
const { authJwt } = require('../middleware');

module.exports = function setroutes(app) {
  app.use(function setheaders(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // Student
  app.post(
    '/api/rental/student/create',
    [authJwt.verifyToken, authJwt.isStudent],
    controller.studentCreateRental
    /* #swagger.tags = ['Rental']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/rental/student/get',
    [authJwt.verifyToken, authJwt.isStudent],
    controller.studentGetRental
    /* #swagger.tags = ['Rental']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/rental/student/list',
    [authJwt.verifyToken, authJwt.isStudent],
    controller.studentRentalList
    /* #swagger.tags = ['Rental']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/rental/student/cancel',
    [authJwt.verifyToken, authJwt.isStudent],
    controller.studentCancelRental
    /* #swagger.tags = ['Rental']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/rental/student/bookeddates',
    [authJwt.verifyToken, authJwt.isStudent],
    controller.studentBookedDates
    /* #swagger.tags = ['Rental']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // Seller / Reseller
  app.get(
    '/api/rental/seller/get',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.sellerGetRental
    /* #swagger.tags = ['Rental']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/rental/seller/list',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.sellerRentalList
    /* #swagger.tags = ['Rental']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/rental/seller/cancel',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.sellerCancelRental
    /* #swagger.tags = ['Rental']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/rental/seller/bookeddates',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.sellerBookedDates
    /* #swagger.tags = ['Rental']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  app.get(
    '/api/rental/room/list',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.roomRentalList
    /* #swagger.tags = ['Rental']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
};
