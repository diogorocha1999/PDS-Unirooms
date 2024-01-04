module.exports = (sequelize, Sequelize) => {
  const Payout = sequelize.define('Payout', {
    payoutId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: Sequelize.INTEGER, // 0 - Owner, 1 - Reseller
      allowNull: false,
      validate: {
        isInt: true,
        max: 1,
        min: 0,
      },
    },
    system_fee: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        max: 100,
        min: 0,
      },
    },
    delegation_fee: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        max: 100,
        min: 0,
      },
    },
    full_amount: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    paid_amount: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        max: 2,
        min: 0,
      },
    },
  });
  return Payout;
};
