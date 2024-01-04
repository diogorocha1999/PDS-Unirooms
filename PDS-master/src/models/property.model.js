module.exports = (sequelize, Sequelize) => {
  const Property = sequelize.define(
    'Property',
    {
      propertyId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address2: {
        type: Sequelize.STRING,
      },
      postcode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      enabled: {
        type: Sequelize.BOOLEAN, // true = available; false = unavailable
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      scopes: {
        public: {
          where: {
            enabled: true,
          },
        },
      },
    }
  );
  return Property;
};
