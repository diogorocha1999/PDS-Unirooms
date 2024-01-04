const { authJwt, verifySignUp } = require('../middleware');
const controller = require('../controllers/auth.controller');

module.exports = function setroutes(app) {
  app.use(function setheaders(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });
  app.post(
    '/api/auth/signup',
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
      verifySignUp.checkAdminExisted,
    ],
    controller.signup
    // #swagger.tags = ['Auth']
  );

  app.post(
    '/api/auth/signin',
    controller.signin
    // #swagger.tags = ['Auth']
  );

  app.put(
    '/api/auth/signout',
    [authJwt.verifyToken],
    controller.signout
    /* #swagger.tags = ['Auth']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  app.post(
    '/api/auth/passwordreset/request',
    controller.pwresetrequest
    // #swagger.tags = ['Auth']
  );

  app.get(
    '/api/auth/passwordreset/:id/:token',
    controller.resetpasswordform
    // #swagger.tags = ['Auth']
  );

  app.post(
    '/api/auth/passwordreset/set',
    controller.setnewpassword
    // #swagger.tags = ['Auth']
  );
};
