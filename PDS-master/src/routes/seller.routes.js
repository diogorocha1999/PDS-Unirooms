const controller = require('../controllers/seller.controller');
const { authJwt } = require('../middleware');

module.exports = function setroutes(app) {
  app.use(function setheaders(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // Seller Info
  app.get(
    '/api/seller/info/get',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.getSeller
    /* #swagger.tags = ['Seller']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/seller/info/update',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.updateSeller
    /* #swagger.tags = ['Seller']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // Seller payouts
  app.get(
    '/api/seller/payout/get',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.getPayout
    /* #swagger.tags = ['Seller']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/seller/payout/list',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.listPayouts
    /* #swagger.tags = ['Seller']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
};
