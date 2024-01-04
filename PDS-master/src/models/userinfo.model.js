module.exports = (sequelize, Sequelize) => {
  const UserInfo = sequelize.define(
    'UserInfo',
    {
      userinfoId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstname: {
        type: Sequelize.STRING,
      },
      lastname: {
        type: Sequelize.STRING,
      },
      birthdate: {
        type: Sequelize.DATE,
        validate: {
          isDate: true,
        },
      },
      address: {
        type: Sequelize.STRING,
      },
      address2: {
        type: Sequelize.STRING,
      },
      postcode: {
        type: Sequelize.STRING,
      },
    },
    {
      scopes: {
        basic: {
          attributes: ['firstname', 'lastname'],
        },
      },
    }
  );
  return UserInfo;
};
