module.exports = function setroutes(app) {
  app.use(function setheaders(req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });
  app.get('/api/', (req, res) => {
    res.send({ message: 'Hello world' });
    // #swagger.tags = ['Main']
  });
};
