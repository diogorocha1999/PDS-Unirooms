module.exports = (sequelize, Sequelize) => {
  const Room = sequelize.define(
    'Room',
    {
      roomId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      bed_number: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      wc: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      hvac: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      desk: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      wardrobe: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      kitchen: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      description: {
        type: Sequelize.STRING,
      },
      monthly_fee: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      enabled: {
        type: Sequelize.BOOLEAN, // true = available; false = unavailable
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
  return Room;
};
