module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define('Role', {
    roleId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return Role;
};
