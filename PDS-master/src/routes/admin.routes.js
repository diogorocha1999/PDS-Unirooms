const { authJwt } = require('../middleware');
const controller = require('../controllers/admin.controller');

module.exports = function setroutes(app) {
  app.use(function setheaders(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  //  User
  app.get(
    '/api/admin/user/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.userGet
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/admin/user/list',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.userList
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/admin/user/enable',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.userEnable
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/admin/user/disable',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.userDisable
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.delete(
    '/api/admin/user/delete',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.userDelete
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/admin/user/addrole',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.userAddRole
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/admin/user/removerole',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.userRemoveRole
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  //  Seller
  app.get(
    '/api/admin/seller/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.sellerGet
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/admin/seller/list',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.sellerList
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  //  Delegations
  app.get(
    '/api/admin/delegation/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delegationGet
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/admin/delegation/list',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delegationList
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  //  Properties
  app.get(
    '/api/admin/property/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.propertyGet
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/admin/property/list',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.propertyList
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/admin/property/enable',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.propertyEnable
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/admin/property/disable',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.propertyDisable
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  //  Rooms
  app.get(
    '/api/admin/room/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.roomGet
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/admin/room/enable',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.roomEnable
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/admin/room/disable',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.roomDisable
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  //  Students
  app.get(
    '/api/admin/student/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.studentGet
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/admin/student/list',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.studentList
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  //  Rentals
  app.get(
    '/api/admin/rental/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.rentalGet
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/admin/rental/cancel',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.rentalCancel
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  //  Payments
  app.get(
    '/api/admin/payment/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.paymentGet
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/admin/payment/list',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.paymentList
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/admin/payment/validate',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.paymentValidate
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/admin/payment/void',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.paymentVoid
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // Seller Payouts
  app.get(
    '/api/system/payout/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getPayout
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/system/payout/list',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.listPayouts
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/system/payout/validate',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.validatePayout
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/system/payout/void',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.voidPayout
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // System Settings
  app.get(
    '/api/system/settings/get',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getSettings
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/system/settings/update',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateSettings
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  // Location
  app.post(
    '/api/system/location/addCountry',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getSettings
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/system/location/updateCountry',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateSettings
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  app.post(
    '/api/system/location/addRegion',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getSettings
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/system/location/updateRegion',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateSettings
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );

  app.post(
    '/api/system/location/addCity',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getSettings
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.put(
    '/api/system/location/updateCity',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateSettings
    /* #swagger.tags = ['Admin']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
};
