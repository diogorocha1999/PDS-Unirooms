const controller = require('../controllers/payment.controller');
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
    '/api/payment/student/pay',
    [authJwt.verifyToken, authJwt.isStudent],
    controller.pay
    /* #swagger.tags = ['Payment']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/payment/student/confirm',
    [authJwt.verifyToken],
    controller.confirmPayment
    /* #swagger.tags = ['Payment']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/payment/student/void',
    [authJwt.verifyToken],
    controller.voidPayment
    /* #swagger.tags = ['Payment']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/payment/student/list',
    [authJwt.verifyToken, authJwt.isStudent],
    controller.listPaymentsStudent
    /* #swagger.tags = ['Payment']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // Seller
  app.get(
    '/api/payment/seller/list',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.listPaymentsSeller
    /* #swagger.tags = ['Payment']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
};
