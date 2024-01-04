module.exports = (sequelize, Sequelize) => {
  const Conversation = sequelize.define('Conversation', {
    conversationId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return Conversation;
};
