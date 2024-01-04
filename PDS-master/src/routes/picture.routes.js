const multer = require('multer');
const controller = require('../controllers/picture.controller');
const { authJwt } = require('../middleware');

const storageinfo = multer.diskStorage({
  destination: (req, file, cb) => {
    const DIR = `./uploads/`;
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, `${Date.now()}_${fileName}`);
  },
});
const upload = multer({
  storage: storageinfo,
  fileFilter: (req, file, cb) => {
    if (!req.query.roomId) {
      cb(null, false);
      return cb(new Error('Missing roomId!'));
    }
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg, and .jpeg formats allowed!'));
    }
    return true;
  },
});

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
    '/api/room/picture/add',
    [authJwt.verifyToken, authJwt.isSeller],
    upload.any('pictures'),
    controller.addPictures
    /* #swagger.tags = ['Picture']
       #swagger.security = [{
               "apiKeyAuth": []
       #swagger.consumes = ['multipart/form-data']
       #swagger.parameters['pictures'] = {
        in: formData
        type: file
        description: Array of picture files to upload.
        required: true
        }] */
  );
  app.get(
    '/api/room/picture/get',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.getPicture
    /* #swagger.tags = ['Picture']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/room/picture/list',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.listPictures
    /* #swagger.tags = ['Picture']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.delete(
    '/api/room/picture/remove',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.removePicture
    /* #swagger.tags = ['Picture']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
};
