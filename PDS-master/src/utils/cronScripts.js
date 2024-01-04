const cron = require('node-cron');
const db = require('../models');

const Property = db.property;
const Room = db.room;
const Conversation = db.conversation;
const BookedDate = db.bookeddate;
const Rental = db.rental;
const SystemSettings = db.systemsettings;
const { Op } = db.Sequelize;

// Check for missing deposit payments
const missingDepositJob = cron.schedule(
  '20 * * * *',
  async () => {
    console.log(
      `Missing Deposits Job Started - ${new Date().toLocaleString()}`
    );
    try {
      const systemsettings = await SystemSettings.findByPk(1);
      const timeLimit = new Date() - systemsettings.depositTimeLimit; // subtract 48 hours
      const rentals = await Rental.findAll({
        where: {
          rental_status: 0,
          createdAt: {
            [Op.lt]: { timeLimit },
          }, // Check if the promise is expired
        },
      });
      if (Object.keys(rentals).length !== 0) {
        await rentals.forEach(async (rental) => {
          const payments = await rental.getPayments({
            where: {
              type: 0,
            },
          });

          if (Object.keys(payments).length !== 0) {
            await payments.forEach(async (payment) => {
              await payment.update({
                status: 2,
              });
            });
          }
          await rental.update({
            rental_status: 5,
          });

          const bookingDates = [];
          for (
            let adate = Date.parse(rental.from);
            adate <= Date.parse(rental.to);
            adate += 86400000
          ) {
            bookingDates.push({
              year: new Date(adate).getFullYear(),
              month: new Date(adate).getMonth() + 1,
              day: new Date(adate).getDate(),
              rentalId: rental.rentalId,
            });
          }

          // Update the booking calendar
          await BookedDate.destroy({
            where: { [Op.or]: bookingDates },
          });

          // Send warning to student
          const studentConversation = await Conversation.create({
            subject: `Rental ${rental.rentalId} - Canceled`,
            creatorId: 1, // system user
            recipientId: rental.studentId,
            roomId: rental.roomId,
          });

          await studentConversation.createMessage({
            content: 'You missed the deposit payment time limit (48 hours).',
            senderId: 1, // system user
            receiverId: rental.studentId,
          });

          // Send warning to reseller/seller
          const sellers = await Room.findByPk(rental.roomId, {
            attributes: [],
            include: [
              {
                model: Property,
                required: true,
                as: 'Property',
                attributes: ['ownerId', 'resellerId'],
              },
            ],
          });

          let receiverSeller = sellers.Property.ownerId;
          if (sellers.Property.resellerId) {
            receiverSeller = sellers.Property.resellerId;
          }

          const sellerConversation = await Conversation.create({
            subject: `Rental ${rental.rentalId} - Canceled`,
            creatorId: 1, // system user
            recipientId: receiverSeller,
            roomId: rental.roomId,
          });

          await sellerConversation.createMessage({
            content:
              'The student missed the deposit payment time limit (48 hours).',
            senderId: 1, // system user
            receiverId: receiverSeller,
          });
        });
      }
    } catch (err) {
      console.error(err);
    }
    console.log(
      `Missing Deposits Job Finished - ${new Date().toLocaleString()}`
    );
  },
  {
    scheduled: false,
  }
);

// Check for missing monthly fee payments
const missingMonthlyFeeJob = cron.schedule(
  '10 * * * *',
  async () => {
    console.log(
      `Missing Payments Job Started - ${new Date().toLocaleString()}`
    );
    try {
      const currentDate = new Date();
      const rentals = await Rental.findAll({
        where: {
          rental_status: 1,
        },
      });
      if (Object.keys(rentals).length !== 0) {
        await rentals.forEach(async (rental) => {
          // check if there are still missing payments
          const monthlyfeecount = await rental.countPayments({
            where: {
              type: 1,
              status: 1,
            },
          });

          const daysMonthDiff =
            rental.from.getUTCDate() < currentDate.getUTCDate() ? 1 : 0;
          const monthsPassed =
            currentDate.getUTCMonth() -
            rental.from.getUTCMonth() -
            daysMonthDiff +
            12 * (currentDate.getFullYear() - rental.from.getFullYear());
          if (monthsPassed > monthlyfeecount) {
            await rental.update({
              payment_status: 2,
            });

            // Send warning to student
            const studentConversation = await Conversation.create({
              subject: `Rental ${rental.rentalId} - Missing Payments`,
              creatorId: 1, // system user
              recipientId: rental.studentId,
              roomId: rental.roomId,
            });

            await studentConversation.createMessage({
              content: 'You have missing payments for this rental.',
              senderId: 1, // system user
              receiverId: rental.studentId,
            });

            // Send warning to reseller/seller
            const sellers = await Room.findByPk(rental.roomId, {
              attributes: [],
              include: [
                {
                  model: Property,
                  required: true,
                  as: 'Property',
                  attributes: ['ownerId', 'resellerId'],
                },
              ],
            });

            let receiverSeller = sellers.Property.ownerId;
            if (sellers.Property.resellerId) {
              receiverSeller = sellers.Property.resellerId;
            }

            const sellerConversation = await Conversation.create({
              subject: `Rental ${rental.rentalId} - Missing payments`,
              creatorId: 1, // system user
              recipientId: receiverSeller,
              roomId: rental.roomId,
            });

            await sellerConversation.createMessage({
              content: 'The student is missing payments for this rental.',
              senderId: 1, // system user
              receiverId: receiverSeller,
            });
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
    console.log(
      `Missing Payments Job Finished - ${new Date().toLocaleString()}`
    );
  },
  {
    scheduled: false,
  }
);

// Check for missing monthly fee payments
const activeRentalsJob = cron.schedule(
  '00 * * * *',
  async () => {
    console.log(`Active Rentals Job Started - ${new Date().toLocaleString()}`);
    try {
      const currentDate = new Date();
      const rentals = await Rental.findAll({
        where: {
          rental_status: {
            [Op.or]: [0, 1],
          },
          from: {
            [Op.lte]: { currentDate },
          },
        },
      });
      if (Object.keys(rentals).length !== 0) {
        await rentals.forEach(async (rental) => {
          if (
            rental.rental_status === 0 &&
            Date.parse(rental.from) < Date.parse(currentDate) &&
            Date.parse(rental.to) > Date.parse(currentDate)
          ) {
            await rental.update({
              rental_status: 1,
            });

            // Send warning to student
            const studentConversation = await Conversation.create({
              subject: `Rental ${rental.rentalId} - Started`,
              creatorId: 1, // system user
              recipientId: rental.studentId,
              roomId: rental.roomId,
            });

            await studentConversation.createMessage({
              content: 'Your rental has started.',
              senderId: 1, // system user
              receiverId: rental.studentId,
            });

            // Send warning to reseller/seller
            const sellers = await Room.findByPk(rental.roomId, {
              attributes: [],
              include: [
                {
                  model: Property,
                  required: true,
                  as: 'Property',
                  attributes: ['ownerId', 'resellerId'],
                },
              ],
            });

            let receiverSeller = sellers.Property.ownerId;
            if (sellers.Property.resellerId) {
              receiverSeller = sellers.Property.resellerId;
            }

            const sellerConversation = await Conversation.create({
              subject: `Rental ${rental.rentalId} - Started`,
              creatorId: 1, // system user
              recipientId: receiverSeller,
              roomId: rental.roomId,
            });

            await sellerConversation.createMessage({
              content: 'This rental has started.',
              senderId: 1, // system user
              receiverId: receiverSeller,
            });
          } else if (
            rental.rental_status === 1 &&
            Date.parse(rental.to) < Date.parse(currentDate)
          ) {
            await rental.update({
              rental_status: 4,
            });

            // Send warning to student
            const studentConversation = await Conversation.create({
              subject: `Rental ${rental.rentalId} - Finished`,
              creatorId: 1, // system user
              recipientId: rental.studentId,
              roomId: rental.roomId,
            });

            await studentConversation.createMessage({
              content: 'Your rental has finished.',
              senderId: 1, // system user
              receiverId: rental.studentId,
            });

            // Send warning to reseller/seller
            const sellers = await Room.findByPk(rental.roomId, {
              attributes: [],
              include: [
                {
                  model: Property,
                  required: true,
                  as: 'Property',
                  attributes: ['ownerId', 'resellerId'],
                },
              ],
            });

            let receiverSeller = sellers.Property.ownerId;
            if (sellers.Property.resellerId) {
              receiverSeller = sellers.Property.resellerId;
            }

            const sellerConversation = await Conversation.create({
              subject: `Rental ${rental.rentalId} - Finished`,
              creatorId: 1, // system user
              recipientId: receiverSeller,
              roomId: rental.roomId,
            });

            await sellerConversation.createMessage({
              content: 'This rental has finished.',
              senderId: 1, // system user
              receiverId: receiverSeller,
            });
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
    console.log(`Active Rentals Job Finished - ${new Date().toLocaleString()}`);
  },
  {
    scheduled: false,
  }
);

module.exports = {
  missingDepositJob,
  missingMonthlyFeeJob,
  activeRentalsJob,
};
