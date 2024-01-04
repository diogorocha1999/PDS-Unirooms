// const app = require('../app');
const controller = require('../controllers/student.controller');
const { authJwt } = require('../middleware');

module.exports = function setroutes(app) {
  app.use(function setheaders(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.get(
    '/api/student/get',
    [authJwt.verifyToken, authJwt.isStudent],
    controller.getStudent
    /* #swagger.tags = ['Student']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  app.put(
    '/api/student/update',
    [authJwt.verifyToken, authJwt.isStudent],
    controller.updateStudent
    /* #swagger.tags = ['Student']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
};
