module.exports = (sequelize, Sequelize) => {
  const Message = sequelize.define('Message', {
    messageId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return Message;
};
