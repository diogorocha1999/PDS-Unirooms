module.exports = (sequelize, Sequelize) => {
  const SystemSettings = sequelize.define('SystemSettings', {
    Id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transactionFee: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        max: 100,
        min: 0,
      },
      defaultValue: 10,
    },
    depositFee: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        max: 100,
        min: 0,
      },
      defaultValue: 20,
    },
    depositTimeLimit: {
      // In seconds
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0,
      },
      defaultValue: 172800,
    },
  });
  return SystemSettings;
};
