module.exports = (sequelize, Sequelize) => {
  const Picture = sequelize.define('Picture', {
    pictureId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return Picture;
};
