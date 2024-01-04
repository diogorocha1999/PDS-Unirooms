const bcrypt = require('bcryptjs');
const db = require('../models');

const User = db.user;
const UserInfo = db.userinfo;
const Room = db.room;
const Rental = db.rental;
const City = db.city;
const Region = db.region;
const Country = db.country;

exports.userGet = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: {
        model: UserInfo,
        as: 'UserInfo',
        include: [
          {
            model: City,
          },
          {
            model: Region,
          },
          {
            model: Country,
          },
        ],
      },
    });

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error retrieving user information' });
  }
};

exports.setBasicInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    await user.update({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    return res
      .status(200)
      .json({ message: 'User information updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating user information' });
  }
};

exports.setExtInfo = async (req, res) => {
  try {
    const userinfo = await UserInfo.findOne({
      where: {
        userId: req.userId,
      },
    });

    await userinfo.update({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      birthdate: req.body.birthdate,
      address: req.body.address,
      address2: req.body.address2,
      postcode: req.body.postcode,
      city_id: req.body.city_id,
      region_id: req.body.region_id,
      country_id: req.body.country_id,
    });

    return res.status(200).json(userinfo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating user information' });
  }
};

exports.addRole = async (req, res) => {
  try {
    let hasRole;
    const user = await User.findByPk(req.userId);

    if (!req.body.role) {
      return res.status(400).json({ message: 'Provide a role name' });
    }
    if (req.body.role === 'student') {
      // student
      if (!req.body.school_name || !req.body.school_email) {
        return res.status(400).json({ message: 'Student details missing!' });
      }
      hasRole = await user.hasRole([4]);

      if (hasRole) {
        return res.status(400).json({ message: 'You already have that role' });
      }
      await user.addRole(4);
      await user.createStudent({
        school_name: req.body.school_name,
        school_email: req.body.school_email,
      });
    } else if (req.body.role === 'seller') {
      // seller

      if (!req.body.iban) {
        return res.status(400).json({ message: 'Seller details missing!' });
      }
      hasRole = await user.hasRole([3]);
      if (hasRole) {
        return res.status(400).json({ message: 'You already have that role' });
      }
      await user.addRole(3);
      await user.createSeller({
        iban: req.body.iban,
      });
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

exports.removeRole = async (req, res) => {
  try {
    let hasRole;
    const user = await User.findByPk(req.userId);

    if (!req.body.role) {
      return res.status(400).json({ message: 'Provide a role name' });
    }
    if (req.body.role === 'student') {
      // student
      hasRole = await user.hasRole(4);
      if (!hasRole) {
        return res.status(400).json({ message: "You don't have that role" });
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
          .json({ message: 'You still have active rentals!' });
      }

      await student.update({
        enabled: false,
        userId: null,
      });

      await user.removeRole(4);
    } else if (req.body.role === 'seller') {
      // seller
      hasRole = await user.hasRole(3);
      if (!hasRole) {
        return res.status(400).json({ message: "You don't have that role" });
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
          .json({ message: 'You still have active rentals!' });
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
