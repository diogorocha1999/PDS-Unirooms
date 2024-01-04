module.exports = (sequelize, Sequelize) => {
  const Delegation = sequelize.define('Delegation', {
    delegationId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    authorized: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    fee: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        max: 100,
        min: 0,
      },
    },
  });
  return Delegation;
};
