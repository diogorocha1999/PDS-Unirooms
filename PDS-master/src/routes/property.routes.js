const controller = require('../controllers/property.controller');
const { authJwt } = require('../middleware');

module.exports = function setroutes(app) {
  app.use(function setheaders(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });
  // CRUD
  app.post(
    '/api/property/add',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.addProperty
    /* #swagger.tags = ['Property']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/property/get',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.getProperty
    /* #swagger.tags = ['Property']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/property/update',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.updateProperty
    /* #swagger.tags = ['Property']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.delete(
    '/api/property/remove',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.removeProperty
    /* #swagger.tags = ['Property']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // Enable / Disable
  app.put(
    '/api/property/enable',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.enableProperty
    /* #swagger.tags = ['Property']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/property/disable',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.disableProperty
    /* #swagger.tags = ['Property']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // Listings
  app.get(
    '/api/property/list',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.propertyList
    /* #swagger.tags = ['Property']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
};
