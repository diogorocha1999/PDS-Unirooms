const db = require('../models');

/* // Drop all tables
const drop = async () => {
  await db.sequelize.drop().catch((error) => console.error(error));
}; */

// close the connection
const close = async () => {
  await db.sequelize.close();
};

module.exports = async () => {
  // Drop tables and close connection
  await close();
};
