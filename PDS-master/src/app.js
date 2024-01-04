const express = require('express');
const cors = require('cors');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../swagger-output.json');

const { errorHandler } = require('./middleware');

const app = express();

const allowList = [
  `${process.env.API_BASEURL}:${process.env.PORT || '8000'}`,
  `${process.env.APP_CORSORIGIN}`,
];
const corsOptions = {
  origin: allowList,
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  maxAge: 7200,
};
app.use(cors(corsOptions)); // https://web.dev/cross-origin-resource-sharing/
app.use(helmet()); // https://expressjs.com/en/advanced/best-practice-security.html#use-helmet
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API documentation
app.use('/api/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/main.routes')(app);
require('./routes/student.routes')(app);
require('./routes/rental.routes')(app);
require('./routes/payment.routes')(app);
require('./routes/messaging.routes')(app);
require('./routes/admin.routes')(app);
require('./routes/seller.routes')(app);
require('./routes/property.routes')(app);
require('./routes/delegation.routes')(app);
require('./routes/room.routes')(app);
require('./routes/picture.routes')(app);
require('./routes/public.routes')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError.NotFound());
});

// pass any unhandled errors to the error handler
app.use(errorHandler);

module.exports = app;
