const controller = require('../controllers/room.controller');
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
    '/api/room/add',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.addRoom
    /* #swagger.tags = ['Room']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/room/get',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.getRoom
    /* #swagger.tags = ['Room']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/room/update',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.updateRoom
    /* #swagger.tags = ['Room']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.delete(
    '/api/room/remove',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.removeRoom
    /* #swagger.tags = ['Room']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // Enable / Disable
  app.put(
    '/api/room/enable',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.enableRoom
    /* #swagger.tags = ['Room']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/room/disable',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.disableRoom
    /* #swagger.tags = ['Room']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // Listings
  app.get(
    '/api/room/list',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.roomList
    /* #swagger.tags = ['Room']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
};
