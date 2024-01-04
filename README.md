# UniRooms API

Web Framework: [ExpressJS](https://expressjs.com/)  
Linting: [eslint](https://eslint.org)  
Code Formatting [prettier](https://prettier.io)  
Auto restart server: [nodemon](https://github.com/remy/nodemon)  
Testing: [Jest](https://jestjs.io)  
Database: [MySQL2](https://github.com/sidorares/node-mysql2)  
Database ORM: [Sequelize](https://sequelize.org/)  
API Documentation: [Swagger](https://swagger.io/)

## Getting Started

### Install dependencies

###### Note: [NodeJS](https://nodejs.org/) with `npm` required

```
npm install
```

### Setup the environment variables

```
.env.example

-- Use this template to set your own environment variables and save the file without .example in the filename --
-- NOTE: DO NOT ALTER OR REMOVE THE TEMPLATE FILE --
```

### Running in development

```
npm run dev
```

Runs on localhost:5000 by default.

### Running in production

```
npm start
```

Runs on localhost:8000 by default.

### Running tests

```
npm test # run all test units

npm test testname # run a single test unit

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Reports available at /test-reports/
Runs on localhost:3000 by default.

### Linting

```
npm run lint

npm run lint:fix # fix issues
```

### Code Formatting

```
npm run format:check

npm run format:write # format code
```

### API Documentation

```
npm run gendoc # auto generate API documentation
```

available at {API_URL:API_PORT}/api/doc
