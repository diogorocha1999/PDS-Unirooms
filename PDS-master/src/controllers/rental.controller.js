const db = require('../models');

const { Op } = db.Sequelize;
const Rental = db.rental;
const Room = db.room;
const Property = db.property;
const BookedDate = db.bookeddate;
const Conversation = db.conversation;

// Student
exports.studentCreateRental = async (req, res) => {
  try {
    if (!req.body.roomId) {
      return res.status(400).json({ message: 'Provide a roomId' });
    }

    if (!req.body.from || !req.body.duration || !req.body.duration > 1) {
      return res
        .status(400)
        .json({ message: 'Provide a from date, and the duration in months' });
    }

    const room = await Room.scope('public').findByPk(req.body.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    const toDate =
      Date.parse(req.body.from) + parseInt(req.body.duration, 10) * 2629743000;

    const bookingDates = [];
    for (
      let adate = Date.parse(req.body.from);
      adate <= toDate;
      adate += 86400000
    ) {
      bookingDates.push({
        year: new Date(adate).getFullYear(),
        month: new Date(adate).getMonth() + 1,
        day: new Date(adate).getDate(),
        roomId: room.roomId,
      });
    }

    // Check the available booking dates
    const unavailabledates = await BookedDate.findAll({
      where: { [Op.or]: bookingDates },
    });

    if (Object.keys(unavailabledates).length !== 0) {
      return res
        .status(400)
        .json({ message: 'Room already booked for that date range.' });
    }

    const rental = await Rental.create({
      from: req.body.from,
      to: toDate,
      monthly_fee: room.monthly_fee,
      payment_status: 0,
      rental_status: 0,
      roomId: req.body.roomId,
      studentId: req.studentId,
    });

    // Update the booking calendar
    bookingDates.forEach(async (bookingDate) => {
      await rental.createBookedDate(bookingDate);
    });

    return res.status(201).json(rental);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating rental' });
  }
};

exports.studentGetRental = async (req, res) => {
  try {
    if (!req.query.rentalId) {
      return res.status(400).json({ message: 'Provide a rentalId' });
    }

    const rental = await Rental.findOne({
      where: {
        rentalId: req.query.rentalId,
        studentId: req.studentId,
      },
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    return res.status(200).json(rental);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting rental' });
  }
};

exports.studentRentalList = async (req, res) => {
  try {
    const whereStatement = {};
    if (req.query.rental_status)
      whereStatement.rental_status = req.query.rental_status;
    if (req.query.payment_status)
      whereStatement.payment_status = req.query.payment_status;
    whereStatement.studentId = req.studentId;

    const rental = await Rental.findAll({
      where: whereStatement,
    });

    if (!rental) {
      return res.status(404).json({ message: 'No rentals found' });
    }

    return res.status(200).json(rental);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error getting student rental list' });
  }
};

exports.studentCancelRental = async (req, res) => {
  try {
    if (!req.body.rentalId) {
      return res.status(400).json({ message: 'Provide a rentalId' });
    }

    const rental = await Rental.findOne({
      where: {
        studentId: req.studentId,
        [Op.or]: [{ rental_status: 0 }, { rental_status: 1 }],
        rentalId: req.body.rentalId,
      },
    });

    if (!rental) {
      return res.status(404).json({ message: 'No rentals found' });
    }

    if (rental.payment_status === 2) {
      // Ongoing and paid
      return res.status(403).json({
        message:
          "You can't cancel a rental with missing payments. Make the missing payments before canceling the rental.",
      });
    }

    await rental.update({
      rental_status: 3,
    });

    let fromDate = Date.parse(rental.from);
    const currentDate = Date.parse(new Date());
    if (fromDate < currentDate) {
      fromDate = currentDate;
    }

    const bookingDates = [];
    for (
      let adate = fromDate;
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
      content: 'The student canceled this rental.',
      senderId: 1, // system user
      receiverId: receiverSeller,
    });

    return res.status(200).json({ message: 'Rental Canceled.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error canceling the rental' });
  }
};

exports.studentBookedDates = async (req, res) => {
  try {
    if (!req.query.rentalId)
      return res.status(400).json({
        message: 'Provide rentalId ',
      });

    const rental = await Rental.findByPk(req.query.rentalId, {
      where: {
        studentId: req.studentId,
      },
    });

    if (!rental) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const bookedDates = await rental.getBookedDates;

    return res.status(200).json(bookedDates);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting booked dates' });
  }
};

// Seller
exports.sellerGetRental = async (req, res) => {
  try {
    if (!req.query.rentalId) {
      return res.status(400).json({ message: 'Provide a rentalId' });
    }

    const rental = await Rental.findByPk(req.query.rentalId, {
      where: {
        [Op.or]: [
          { '$Room.Property.ownerId$': req.sellerId },
          { '$Room.Property.resellerId$': req.sellerId },
        ],
      },
      include: [
        {
          model: Room,
          required: false,
          as: 'Room',
          attributes: [],
          include: [
            {
              model: Property,
              required: false,
              as: 'Property',
              attributes: [],
            },
          ],
        },
      ],
    });

    if (!rental) {
      return res.status(404).json({ message: 'No rentals found' });
    }

    return res.status(200).json(rental);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting rental' });
  }
};

exports.sellerRentalList = async (req, res) => {
  try {
    let whereStatement = {};

    whereStatement = {
      [Op.or]: [
        { '$Room.Property.ownerId$': req.sellerId },
        { '$Room.Property.resellerId$': req.sellerId },
      ],
    };
    if (req.query.rental_status)
      whereStatement.rental_status = req.query.rental_status;
    if (req.query.payment_status)
      whereStatement.payment_status = req.query.payment_status;

    const rentals = await Rental.findAll({
      where: whereStatement,
      include: [
        {
          model: Room,
          required: false,
          as: 'Room',
          attributes: [],
          include: [
            {
              model: Property,
              required: false,
              as: 'Property',
              attributes: [],
            },
          ],
        },
      ],
    });

    if (Object.keys(rentals).length === 0) {
      return res.status(404).json({ message: 'No Rental found' });
    }

    return res.status(200).json(rentals);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error getting seller rental list' });
  }
};

exports.sellerCancelRental = async (req, res) => {
  try {
    if (!req.body.rentalId) {
      return res.status(400).json({ message: 'Provide a rentalId' });
    }

    const rental = await Rental.findByPk(req.body.rentalId, {
      where: {
        [Op.or]: [
          { '$Room.Property.ownerId$': req.sellerId },
          { '$Room.Property.resellerId$': req.sellerId },
        ],
        [Op.or]: [{ rental_status: 0 }, { rental_status: 1 }],
      },
      include: [
        {
          model: Room,
          required: false,
          as: 'Room',
          attributes: [],
          include: [
            {
              model: Property,
              required: false,
              as: 'Property',
              attributes: [],
            },
          ],
        },
      ],
    });

    if (!rental) {
      return res.status(404).json({ message: 'No rentals found' });
    }

    if (rental.rental_status === 1 && rental.payment_status !== 2) {
      // Ongoing and paid
      return res.status(403).json({
        message:
          "You can't cancel an ongoing rental unless there are two missing payments.",
      });
    }

    if (rental.rental_status === 1) {
      // check again for missing payments
      const monthlyfeecount = await rental.countPayments({
        where: {
          type: 1,
          status: 1,
        },
      });
      const currentDate = new Date();

      // Check if there are two or more missed monthy fee payments
      const daysMonthDiff =
        rental.from.getUTCDate() < currentDate.getUTCDate() ? 1 : 0;
      const monthsPassed =
        currentDate.getUTCMonth() -
        rental.from.getUTCMonth() -
        daysMonthDiff +
        12 * (currentDate.getFullYear() - rental.from.getFullYear());
      if (monthsPassed - 1 > monthlyfeecount) {
        return res.status(403).json({
          message:
            "You can't cancel an ongoing rental unless there are two missing payments.",
        });
      }
    }

    await rental.update({
      rental_status: 2,
    });

    let fromDate = Date.parse(rental.from);
    const currentDate = Date.parse(new Date());
    if (fromDate < currentDate) {
      fromDate = currentDate;
    }

    const bookingDates = [];
    for (
      let adate = fromDate;
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
      content:
        'The seller canceled your rental because you missed two monthly fee payments.',
      senderId: 1, // system user
      receiverId: rental.studentId,
    });

    return res.status(200).json({ message: 'Rental Canceled.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error canceling the rental' });
  }
};

exports.sellerBookedDates = async (req, res) => {
  try {
    if (!req.query.rentalId)
      return res.status(400).json({
        message: 'Provide rentalId ',
      });

    const rental = await Rental.findByPk(req.query.rentalId, {
      where: {
        [Op.or]: [
          { '$Room.Property.ownerId$': req.sellerId },
          { '$Room.Property.resellerId$': req.sellerId },
        ],
        [Op.or]: [{ rental_status: 0 }, { rental_status: 1 }],
      },
      include: [
        {
          model: Room,
          required: false,
          as: 'Room',
          attributes: [],
          include: [
            {
              model: Property,
              required: false,
              as: 'Property',
              attributes: [],
            },
          ],
        },
      ],
    });

    if (!rental) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const bookedDates = await rental.getBookedDates;

    return res.status(200).json(bookedDates);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting booked dates' });
  }
};

// Room
exports.roomRentalList = async (req, res) => {
  try {
    if (!req.query.roomlId) {
      return res.status(400).json({ message: 'Provide a roomId' });
    }

    const room = Room.findByPk(req.query.roomlId, {
      where: {
        [Op.or]: [
          { '$Room.Property.ownerId$': req.sellerId },
          { '$Room.Property.resellerId$': req.sellerId },
        ],
      },
      include: [
        {
          model: Property,
          required: false,
          as: 'Property',
          attributes: [],
        },
      ],
    });

    if (!room) {
      return res.status(404).json({ message: 'No Room found' });
    }

    const whereStatement = {};
    if (req.body.rental_status)
      whereStatement.rental_status = req.body.rental_status;
    if (req.body.payment_status)
      whereStatement.payment_status = req.body.payment_status;

    const rentals = await room.getRentals({
      where: whereStatement,
    });

    if (!rentals || Object.keys(rentals).length === 0) {
      return res.status(404).json({ message: 'No Rental found' });
    }

    return res.status(200).json(rentals);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting room rental list' });
  }
};
