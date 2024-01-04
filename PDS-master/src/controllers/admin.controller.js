const db = require('../models');

const User = db.user;
const Seller = db.seller;
const Property = db.property;
const Room = db.room;
const Student = db.student;
const Rental = db.rental;
const Payment = db.payment;
const Payout = db.payout;
const Delegation = db.delegation;
const SystemSettings = db.systemsettings;
const City = db.city;
const Region = db.region;
const Country = db.country;
const { Op } = db.Sequelize;

// User
exports.userGet = async (req, res) => {
  try {
    if (!req.query.userId && !req.query.username)
      return res
        .status(400)
        .json({ message: 'Provide a valid userId or username' });

    const whereStatement = {};
    if (req.query.userId) whereStatement.userId = req.query.userId;
    if (req.query.username) whereStatement.username = req.query.username;
    const user = await User.findOne({
      where: whereStatement,
      include: { all: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'No user was found' });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.userList = async (req, res) => {
  try {
    const userlist = await User.findAll();

    if (!userlist) {
      return res.status(404).json({ message: 'No users were found' });
    }

    return res.status(200).json(userlist);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.userEnable = async (req, res) => {
  try {
    if (!req.body.userId)
      return res.status(400).json({ message: 'Provide a valid userId' });

    const user = await User.findByPk(req.body.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: 'No user with that Id was found' });
    }

    await user.update({
      enabled: true,
    });

    return res.status(200).json({ message: 'User enabled' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.userDisable = async (req, res) => {
  try {
    if (!req.body.userId)
      return res.status(400).json({ message: 'Provide a valid userId' });

    const user = await User.findByPk(req.body.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: 'No user with that Id was found' });
    }

    await user.update({
      enabled: false,
    });

    return res.status(200).json({ message: 'User disabled' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.userDelete = async (req, res) => {
  try {
    if (!req.body.userId)
      return res.status(400).json({ message: 'Provide a valid userId' });

    const user = await User.findByPk(req.body.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: 'No user with that Id was found' });
    }

    user.destroy();

    return res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.userAddRole = async (req, res) => {
  try {
    if (!req.body.userId)
      return res.status(400).json({ message: 'Provide a valid userId' });

    if (!req.body.role) {
      return res.status(400).json({ message: 'Provide a role name' });
    }

    let hasRole;
    const user = await User.findByPk(req.body.userId);

    if (req.body.role === 'student') {
      // student
      if (!req.body.school_name || !req.body.school_email) {
        return res.status(400).json({ message: 'Student details missing!' });
      }
      hasRole = await user.hasRole([4]);

      if (hasRole) {
        return res.status(400).json({ message: 'User already has that role' });
      }
      await user.addRole(4);
      await user.createStudent({
        school_name: req.body.school_name,
        school_email: req.body.school_email,
      });
    } else if (req.body.role === 'seller') {
      if (!req.body.iban) {
        // seller
        return res.status(400).json({ message: 'Seller details missing!' });
      }
      hasRole = await user.hasRole([3]);
      if (hasRole) {
        return res.status(400).json({ message: 'User already has that role' });
      }
      await user.addRole(3);
      await user.createStudent({
        iban: req.body.iban,
      });
    } else if (req.body.role === 'admin') {
      hasRole = await user.hasRole([2]);

      if (hasRole) {
        return res
          .status(400)
          .json({ message: 'The user already have that role' });
      }

      await user.addRole(2);
    } else {
      // invalid role
      return res.status(400).json({ message: 'Invalid Role' });
    }

    return res.status(200).json({ message: 'Role added successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error adding role' });
  }
};

exports.userRemoveRole = async (req, res) => {
  try {
    if (!req.body.userId)
      return res.status(400).json({ message: 'Provide a valid userId' });

    if (!req.body.role) {
      return res.status(400).json({ message: 'Provide a role name' });
    }
    let hasRole;
    const user = await User.findByPk(req.body.userId);

    if (req.body.role === 'student') {
      // student
      hasRole = await user.hasRole(4);
      if (!hasRole) {
        return res.status(400).json({ message: "User doesn't have that role" });
      }
      const student = await user.getStudent();

      const hasActiveRentals = await student.getRentals({
        where: {
          rental_status: 1,
        },
      });

      if (Object.keys(hasActiveRentals).length !== 0) {
        return res
          .status(403)
          .json({ message: 'Student still has active rentals!' });
      }

      await student.update({
        enabled: false,
        userId: null,
      });

      await user.removeRole(4);
    } else if (req.body.role === 'seller') {
      // student
      hasRole = await user.hasRole(3);
      if (!hasRole) {
        return res.status(400).json({ message: "User doesn't have that role" });
      }
      const seller = await user.getSeller();
      const hasActiveRentals = await seller.getProperties({
        where: {
          '$Rooms.Rentals.rental_status$': 1,
        },
        include: [
          {
            model: Room,
            as: 'Rooms',
            include: [
              {
                model: Rental,
                as: 'Rentals',
              },
            ],
          },
        ],
      });

      if (Object.keys(hasActiveRentals).length !== 0) {
        return res
          .status(403)
          .json({ message: 'Seller still has active rentals!' });
      }

      const properties = await seller.getProperties();

      let rooms;
      await properties.forEach(async (property) => {
        rooms = await property.getRooms();
        if (rooms) {
          await rooms.forEach(async (room) => {
            await room.update({
              enabled: false,
            });
          });
        }
        await property.update({
          enabled: false,
        });

        await property.removeDelegation();
      });

      await seller.update({
        enabled: false,
        userId: null,
      });

      await user.removeRole(3);
    } else if (req.body.role === 'admin') {
      if (req.body.userId === req.userId)
        return res.status(400).json({ message: 'Invalid operation' });

      hasRole = await user.hasRole([2]);

      if (!hasRole) {
        return res
          .status(400)
          .json({ message: "The user doesn't have that role" });
      }

      await user.removeRole(2);
    } else {
      // invalid role
      return res.status(400).json({ message: 'Invalid Role' });
    }

    return res.status(200).json({ message: 'Role removed successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error removing role' });
  }
};

// Sellers
exports.sellerGet = async (req, res) => {
  try {
    if (!req.query.userId && !req.query.sellerId)
      return res
        .status(400)
        .json({ message: 'Provide a valid userId or sellerId' });

    const whereStatement = {};
    if (req.query.userId) whereStatement.userId = req.query.userId;
    if (req.query.sellerId) whereStatement.sellerId = req.query.sellerId;

    const seller = await Seller.findOne({
      where: whereStatement,
      include: { all: true },
    });
    if (!seller) {
      return res.status(404).json({ message: 'No seller was found' });
    }
    return res.status(200).json(seller);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.sellerList = async (req, res) => {
  try {
    const sellerlist = await Seller.findAll();

    if (!sellerlist) {
      return res.status(404).json({ message: 'No sellers were found' });
    }

    return res.status(200).json(sellerlist);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.sellerEnable = async (req, res) => {
  try {
    if (!req.body.sellerId)
      return res.status(400).json({ message: 'Provide a valid sellerId' });

    const seller = await Seller.findByPk(req.body.sellerId);

    if (!seller) {
      return res
        .status(404)
        .json({ message: 'No seller with that Id was found' });
    }

    await seller.update({
      enabled: true,
    });

    return res.status(200).json({ message: 'Seller enabled' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.sellerDisable = async (req, res) => {
  try {
    if (!req.body.sellerId)
      return res.status(400).json({ message: 'Provide a valid sellerId' });

    const seller = await Seller.findByPk(req.body.sellerId);

    if (!seller) {
      return res
        .status(404)
        .json({ message: 'No seller with that Id was found' });
    }

    await seller.update({
      enabled: false,
    });

    return res.status(200).json({ message: 'Seller disabled' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Delegations
exports.delegationGet = async (req, res) => {
  try {
    if (!req.query.delegationId)
      return res.status(400).json({ message: 'Provide a valid delegationId' });

    const delegation = await Delegation.findByPk(req.query.delegationId, {
      include: { all: true },
    });
    if (!delegation) {
      return res.status(404).json({ message: 'No delegation was found' });
    }
    return res.status(200).json(delegation);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.delegationList = async (req, res) => {
  try {
    const delegationlist = await Delegation.findAll();

    if (!delegationlist) {
      return res.status(404).json({ message: 'No delegations were found' });
    }

    return res.status(200).json(delegationlist);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Properties
exports.propertyGet = async (req, res) => {
  try {
    if (!req.query.propertyId)
      return res.status(400).json({ message: 'Provide a valid propertyId' });

    const property = await Property.findByPk(req.query.propertyId, {
      include: {
        model: Room,
        as: 'Rooms',
      },
    });
    if (!property) {
      return res
        .status(404)
        .json({ message: 'No property with that Id found' });
    }
    return res.status(200).json(property);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.propertyList = async (req, res) => {
  try {
    if (!req.query.sellerId)
      return res.status(400).json({ message: 'Provide a valid sellerId' });

    const propertylist = await Property.findAll({
      where: { ownerId: req.query.sellerId },
      include: {
        model: Room,
        as: 'Rooms',
      },
    });

    if (!propertylist || !propertylist[0]) {
      return res.status(404).json({ message: 'No properties were found' });
    }

    return res.status(200).json(propertylist);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.propertyEnable = async (req, res) => {
  try {
    if (!req.body.propertyId)
      return res.status(400).json({ message: 'Provide a valid propertyId' });

    const property = await Property.findByPk(req.body.propertyId);

    if (!property) {
      return res
        .status(404)
        .json({ message: 'No property with that Id was found' });
    }

    await property.update({
      enabled: true,
    });

    return res.status(200).json({ message: 'Property enabled' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.propertyDisable = async (req, res) => {
  try {
    if (!req.body.propertyId)
      return res.status(400).json({ message: 'Provide a valid propertyId' });

    const property = await Property.findByPk(req.body.propertyId);

    if (!property) {
      return res
        .status(404)
        .json({ message: 'No property with that Id was found' });
    }

    const rooms = property.getRooms({
      where: {
        enabled: true,
      },
    });

    if (Object.keys(rooms).length > 0) {
      await rooms.forEach(async (room) => {
        await room.update({
          enabled: false,
        });
      });
    }

    await property.update({
      enabled: false,
    });

    return res.status(200).json({ message: 'Property disabled' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Rooms
exports.roomGet = async (req, res) => {
  try {
    if (!req.query.roomId)
      return res.status(400).json({ message: 'Provide a valid roomId' });

    const room = await Room.findByPk(req.query.roomId, {
      include: { all: true },
    });
    if (!room) {
      return res.status(404).json({ message: 'No room with that Id found' });
    }
    return res.status(200).json(room);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.roomList = async (req, res) => {
  try {
    if (!req.query.propertyId)
      return res.status(400).json({ message: 'Provide a valid propertyId' });

    const roomlist = await Room.findAll({
      where: {
        propertyId: req.query.propertyId,
      },
    });

    if (!roomlist) {
      return res.status(404).json({ message: 'No rooms were found' });
    }

    return res.status(200).json(roomlist);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.roomEnable = async (req, res) => {
  try {
    if (!req.body.roomId)
      return res.status(400).json({ message: 'Provide a valid roomId' });

    const room = await Room.findByPk(req.body.roomId);

    if (!room) {
      return res
        .status(404)
        .json({ message: 'No room with that Id was found' });
    }

    await room.update({
      enabled: true,
    });

    return res.status(200).json({ message: 'Room enabled' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.roomDisable = async (req, res) => {
  try {
    if (!req.body.roomId)
      return res.status(400).json({ message: 'Provide a valid roomId' });

    const room = await Room.findByPk(req.body.roomId);

    if (!room) {
      return res
        .status(404)
        .json({ message: 'No room with that Id was found' });
    }

    await room.update({
      enabled: false,
    });

    return res.status(200).json({ message: 'Room disabled' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Students
exports.studentGet = async (req, res) => {
  try {
    if (!req.query.userId && !req.query.studentId)
      return res
        .status(400)
        .json({ message: 'Provide a valid userId or studentId' });

    const whereStatement = {};
    if (req.query.userId) whereStatement.userId = req.query.userId;
    if (req.query.studentId) whereStatement.studentId = req.query.studentId;

    const student = await Student.findOne({
      where: whereStatement,
      include: { all: true },
    });
    if (!student) {
      return res.status(404).json({ message: 'No student was found' });
    }
    return res.status(200).json(student);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.studentList = async (req, res) => {
  try {
    const studentlist = await Student.findAll();

    if (!studentlist) {
      return res.status(404).json({ message: 'No students were found' });
    }

    return res.status(200).json(studentlist);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Rentals
exports.rentalGet = async (req, res) => {
  try {
    if (!req.query.rentalId)
      return res.status(400).json({ message: 'Provide a valid rentalId' });

    const rental = await Rental.findByPk(req.query.rentalId, {
      include: { all: true },
    });
    if (!rental) {
      return res.status(404).json({ message: 'No rental with that Id found' });
    }
    return res.status(200).json(rental);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.rentalList = async (req, res) => {
  try {
    if (!req.query.studentId)
      return res.status(400).json({ message: 'Provide a valid studentlId' });

    const rentallist = await Rental.findAll({
      where: {
        studentId: req.query.studentId,
      },
    });

    if (!rentallist) {
      return res.status(404).json({ message: 'No rentals were found' });
    }

    return res.status(200).json(rentallist);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.rentalCancel = async (req, res) => {
  try {
    if (!req.body.rentalId)
      return res.status(400).json({ message: 'Provide a valid rentalId' });

    const rental = await Rental.findByPk(req.body.rentalId);

    if (!rental) {
      return res
        .status(404)
        .json({ message: 'No rental with that Id was found' });
    }

    await rental.update({
      rental_status: 5,
    });

    return res.status(200).json({ message: 'Rental canceled' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Payments
exports.paymentGet = async (req, res) => {
  try {
    if (!req.query.paymentId)
      return res.status(400).json({ message: 'Provide a valid paymentId' });

    const payment = await Payment.findByPk(req.query.paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'No payment with that Id found' });
    }
    return res.status(200).json(payment);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.paymentList = async (req, res) => {
  try {
    const paymentlist = await Payment.findAll();

    if (!paymentlist) {
      return res.status(404).json({ message: 'No payments were found' });
    }

    return res.status(200).json(paymentlist);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.paymentValidate = async (req, res) => {
  try {
    if (!req.body.paymentId)
      return res.status(400).json({ message: 'Provide a valid paymentId' });

    const payment = await Payment.findByPk(req.body.paymentId);

    if (!payment) {
      return res
        .status(404)
        .json({ message: 'No payment with that Id was found' });
    }

    await payment.update({
      status: true,
    });

    return res.status(200).json({ message: 'Payment validated' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.paymentVoid = async (req, res) => {
  try {
    if (!req.body.paymentId)
      return res.status(400).json({ message: 'Provide a valid paymentId' });

    const payment = await Payment.findByPk(req.body.paymentId);

    if (!payment) {
      return res
        .status(404)
        .json({ message: 'No payment with that Id was found' });
    }

    await payment.update({
      status: false,
    });

    return res.status(200).json({ message: 'Payment void' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getPayout = async (req, res) => {
  try {
    if (!req.query.payoutId)
      return res
        .status(400)
        .json({ message: 'Provide a valid payoutId and status' });

    const payout = await Payout.findByPk(req.query.payoutId);

    if (!payout) {
      return res
        .status(404)
        .json({ message: 'No Payout with that Id was found' });
    }

    return res.status(200).json(payout);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.listPayouts = async (req, res) => {
  try {
    if (!req.query.from || !req.query.to || !req.query.status)
      return res
        .status(400)
        .json({ message: 'Provide valid from and to dates, and status' });

    const payoutlist = await Payout.findAll({
      where: {
        [Op.and]: [
          {
            createdAt: {
              [Op.lt]: Date.parse(req.query.to),
              [Op.gt]: Date.parse(req.query.from),
            },
          },
          { status: req.query.status },
        ],
      },
    });

    if (!payoutlist || Object.keys(payoutlist).length === 0) {
      return res
        .status(404)
        .json({ message: 'No Payouts for that period were found' });
    }

    return res.status(200).json(payoutlist);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.validatePayout = async (req, res) => {
  try {
    if (!req.body.payoutId)
      return res.status(400).json({ message: 'Provide a valid payoutId' });

    const payout = await Payout.findByPk(req.body.payoutId);

    if (!payout) {
      return res
        .status(404)
        .json({ message: 'No Payout with that Id was found' });
    }

    await payout.update({
      status: 1,
    });

    return res.status(200).json({ message: 'Payout sucessfully validated' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.voidPayout = async (req, res) => {
  try {
    if (!req.body.payoutId)
      return res.status(400).json({ message: 'Provide a valid payoutId' });

    const payout = await Payout.findByPk(req.body.payoutId);

    if (!payout) {
      return res
        .status(404)
        .json({ message: 'No Payout with that Id was found' });
    }

    await payout.update({
      status: 2,
    });

    return res.status(200).json({ message: 'Payout sucessfully void' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// System Settings
exports.getSettings = async (req, res) => {
  try {
    const systemsettings = await SystemSettings.findByPk(1);

    if (!systemsettings) {
      return res.status(404).json({ message: 'No System Settings were set' });
    }

    return res.status(200).json(systemsettings);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const systemsettings = await SystemSettings.findByPk(1);

    if (!systemsettings) {
      SystemSettings.create({
        Id: 1,
        transactionFee: req.body.transactionFee,
        depositFee: req.body.depositFee,
        depositTimeLimit: req.body.depositTimeLimit,
      });
      return res.status(201).json(systemsettings);
    }
    systemsettings.transactionFee = req.body.transactionFee;
    systemsettings.depositFee = req.body.depositFee;
    systemsettings.depositTimeLimit = req.body.depositTimeLimit;

    await systemsettings.save();

    return res.status(204).json({ message: 'System Settings Updated' });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Location Data
exports.addCountry = async (req, res) => {
  try {
    if (!req.body.name || !req.body.code) {
      return res
        .status(400)
        .json({ message: 'Provide a country name and code' });
    }

    const country = await Country.create({
      name: req.body.name,
      code: req.body.code,
    });

    return res.status(201).json(country);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.updateCountry = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).json({ message: 'Provide an id' });
    }

    if (!req.body.name && !req.body.code) {
      return res
        .status(400)
        .json({ message: 'Provide a country name and code' });
    }

    const country = await Country.findByPk(req.body.id);

    await country.update({
      name: req.body.name,
      code: req.body.code,
    });

    return res.status(201).json(country);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.addRegion = async (req, res) => {
  try {
    if (!req.body.country_id) {
      return res.status(400).json({ message: 'Provide a country_id' });
    }

    if (!req.body.name || !req.body.code) {
      return res
        .status(400)
        .json({ message: 'Provide a region name and code' });
    }

    const region = await Region.create({
      name: req.body.name,
      code: req.body.code,
      country_id: req.body.country_id,
    });

    return res.status(201).json(region);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.updateRegion = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).json({ message: 'Provide an id' });
    }

    if (!req.body.name && !req.body.code) {
      return res
        .status(400)
        .json({ message: 'Provide a region name and code' });
    }

    const region = await Region.findByPk(req.body.id);

    await region.update({
      name: req.body.name,
      code: req.body.code,
    });

    return res.status(201).json(region);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.addCity = async (req, res) => {
  try {
    if (!req.body.region_id) {
      return res.status(400).json({ message: 'Provide a region_id' });
    }

    if (!req.body.name || !req.body.latitude || !req.body.longitude) {
      return res
        .status(400)
        .json({ message: 'Provide a city name, latitude and longitude' });
    }

    const region = await Region.findByPk(req.body.region_id);

    const city = await City.create({
      name: req.body.name,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      region_id: region.id,
      country_id: region.country_id,
    });

    return res.status(201).json(city);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.updateCity = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).json({ message: 'Provide an id' });
    }

    if (!req.body.name || !req.body.latitude || !req.body.longitude) {
      return res
        .status(400)
        .json({ message: 'Provide a city name, latitude and longitude' });
    }

    const city = await City.findByPk(req.body.id);

    await city.update({
      name: req.body.name,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });

    return res.status(201).json(city);
  } catch (err) {
    return res.status(500).json(err);
  }
};
