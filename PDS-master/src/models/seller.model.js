module.exports = (sequelize, Sequelize) => {
  const Seller = sequelize.define(
    'Seller',
    {
      sellerId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      iban: {
        type: Sequelize.STRING,
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      scopes: {
        public: {
          attributes: ['sellerId'],
        },
      },
    }
  );
  return Seller;
};
