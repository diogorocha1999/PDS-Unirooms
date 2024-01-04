module.exports = (sequelize, Sequelize) => {
  const Payment = sequelize.define(
    'Payment',
    {
      paymentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      card_number: {
        type: Sequelize.BIGINT(16).UNSIGNED.ZEROFILL,
        allowNull: false,
        validate: {
          isCreditCard: true,
        },
      },
      card_owner: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ccv: {
        type: Sequelize.SMALLINT(5),
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      type: {
        type: Sequelize.INTEGER, // 0 - deposit, 1 - rental fee, 2 - other, 3 - rental termination (only values between 0 and 2 should be sent by the client)
        allowNull: false,
        defaultValue: 1,
        validate: {
          isInt: true,
          max: 3,
          min: 0,
        },
      },
      status: {
        type: Sequelize.INTEGER, // 0 - waiting confirmation, 1 - confirmed, 2 - void
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: true,
          max: 2,
          min: 0,
        },
      },
    },
    {
      defaultScope: {
        attributes: { exclude: ['card_number', 'card_owner', 'ccv'] },
      },
      scopes: {
        withCreditCard: {
          attributes: {},
        },
      },
    }
  );
  return Payment;
};
