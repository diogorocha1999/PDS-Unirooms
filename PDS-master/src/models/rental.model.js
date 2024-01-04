module.exports = (sequelize, Sequelize) => {
  const Rental = sequelize.define('Rental', {
    rentalId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    from: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    to: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    duration: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.to.getUTCMonth() - this.from.getUTCMonth();
      },
      set(/* value */) {
        throw new Error('Do not try to set the `duration` value!');
      },
    },
    monthly_fee: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    payment_status: {
      type: Sequelize.INTEGER, // 0 - Waiting deposit, 1 - Ok, 2 - Missing payments, 3 - Fully Paid
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        max: 3,
        min: 0,
      },
    },
    rental_status: {
      type: Sequelize.INTEGER, // 0 - Promised Rental, 1 - Ongoing Rental, 2 - Rental canceled by seller, 3 - Rental canceled by student, 4 - Finished Rental, 5 - Cancelled by System
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        max: 5,
        min: 0,
      },
    },
  });
  return Rental;
};
