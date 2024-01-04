require('dotenv').config();

const swaggerAutogen = require('swagger-autogen')({ autoHeaders: false });

const doc = {
  info: {
    title: 'UniRooms API',
    description: 'Documentation for the UniRooms API',
  },
  host: `${process.env.APP_FULLURL}`,
  schemes: ['http', 'https'],
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'x-access-token',
      description: 'Authentication token',
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = [
  './src/routes/admin.routes.js',
  './src/routes/auth.routes.js',
  './src/routes/delegation.routes.js',
  './src/routes/messaging.routes.js',
  './src/routes/payment.routes.js',
  './src/routes/picture.routes.js',
  './src/routes/property.routes.js',
  './src/routes/public.routes.js',
  './src/routes/rental.routes.js',
  './src/routes/room.routes.js',
  './src/routes/seller.routes.js',
  './src/routes/student.routes.js',
  './src/routes/user.routes.js',
];

swaggerAutogen(outputFile, endpointsFiles, doc);
