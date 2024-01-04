module.exports = (sequelize, Sequelize) => {
  const Student = sequelize.define(
    'Student',
    {
      studentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      school_name: {
        type: Sequelize.STRING,
      },
      school_email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true,
        },
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
          attributes: ['studentId'],
        },
      },
    }
  );
  return Student;
};
