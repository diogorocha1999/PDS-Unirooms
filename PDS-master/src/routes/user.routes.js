const { authJwt } = require('../middleware');
const controller = require('../controllers/user.controller');

module.exports = function setroutes(app) {
  app.use(function setheaders(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.get(
    '/api/user/info/get',
    [authJwt.verifyToken],
    controller.userGet
    /* #swagger.tags = ['User']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/user/info/setbasic',
    [authJwt.verifyToken],
    controller.setBasicInfo
    /* #swagger.tags = ['User']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/user/info/setextended',
    [authJwt.verifyToken],
    controller.setExtInfo
    /* #swagger.tags = ['User']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/user/roles/add',
    [authJwt.verifyToken],
    controller.addRole
    /* #swagger.tags = ['User']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/user/roles/remove',
    [authJwt.verifyToken],
    controller.removeRole
    /* #swagger.tags = ['User']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
};
