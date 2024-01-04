module.exports = (sequelize, Sequelize) => {
  const City = sequelize.define(
    'City',
    {
      id: {
        type: Sequelize.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      region_id: {
        type: Sequelize.SMALLINT(5).UNSIGNED,
        allowNull: false,
      },
      country_id: {
        type: Sequelize.SMALLINT(5).UNSIGNED,
        allowNull: false,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
  return City;
};
