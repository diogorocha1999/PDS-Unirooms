module.exports = (sequelize, Sequelize) => {
  const Region = sequelize.define(
    'Region',
    {
      id: {
        type: Sequelize.SMALLINT(5).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      code: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
    },
    { timestamps: false }
  );
  return Region;
};
