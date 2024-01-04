const controller = require('../controllers/delegation.controller');
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
    '/api/delegation/add',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.addDelegation
    /* #swagger.tags = ['Delegation']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/delegation/get',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.getDelegation
    /* #swagger.tags = ['Delegation']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/delegation/update',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.updateDelegation
    /* #swagger.tags = ['Delegation']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.delete(
    '/api/delegation/remove',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.removeDelegation
    /* #swagger.tags = ['Delegation']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // Listings
  app.get(
    '/api/delegation/createdlist',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.createdDelegationList
    /* #swagger.tags = ['Delegation']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/delegation/assignedlist',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.assignedDelegationList
    /* #swagger.tags = ['Delegation']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // Other
  app.put(
    '/api/delegation/approve',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.approveDelegation
    /* #swagger.tags = ['Delegation']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
};
