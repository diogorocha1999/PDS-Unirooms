module.exports = (sequelize, Sequelize) => {
  const BookedDate = sequelize.define('BookedDate', {
    year: {
      type: Sequelize.SMALLINT(5),
      allowNull: false,
    },
    month: {
      type: Sequelize.SMALLINT(2),
      allowNull: false,
    },
    day: {
      type: Sequelize.SMALLINT(2),
      allowNull: false,
    },
  });
  return BookedDate;
};
