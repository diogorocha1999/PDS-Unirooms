const db = require('../models');

const Seller = db.seller;
const Student = db.student;
const User = db.user;
const Property = db.property;
const Room = db.room;
const Picture = db.picture;
const City = db.city;
const Region = db.region;
const Country = db.country;
const BookedDate = db.bookeddate;
const { Op } = db.Sequelize;

exports.userGet = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(400).json({ message: 'Provide a userId' });
    }
    const user = await User.scope('public').findByPk(req.query.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error retrieving user information' });
  }
};

exports.getSeller = async (req, res) => {
  try {
    if (!req.query.sellerId) {
      return res.status(400).json({ message: 'Provide a sellerId' });
    }
    const seller = await Seller.scope('public').findByPk(req.query.sellerId, {
      include: [
        {
          model: User.scope('public'),
        },
      ],
    });

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    return res.status(200).json(seller);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error retrieving seller information' });
  }
};

exports.getStudent = async (req, res) => {
  try {
    if (!req.query.studentId) {
      return res.status(400).json({ message: 'Provide a studentId' });
    }
    const student = await Student.scope('public').findByPk(
      req.query.studentId,
      {
        include: [
          {
            model: User.scope('public'),
          },
        ],
      }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json(student);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error retrieving student information' });
  }
};

exports.getProperty = async (req, res) => {
  try {
    if (!req.query.propertyId) {
      return res.status(400).json({ message: 'Provide a propertyId' });
    }

    const property = await Property.scope('public').findByPk(
      req.query.propertyId,
      {
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
      }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    return res.status(200).json(property);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting property' });
  }
};

exports.propertyList = async (req, res) => {
  try {
    if (
      !req.query.sellerId &&
      !req.query.country_id &&
      !req.query.region_id &&
      !req.query.city_id
    )
      return res.status(400).json({
        message:
          'Provide a valid sellerId and/or a country_id, region_id or city_id',
      });

    let whereStatement = {};

    if (req.query.sellerId) {
      whereStatement = {
        [Op.or]: [
          { ownerId: req.query.sellerId },
          { resellerId: req.query.sellerId },
        ],
      };
    }
    if (req.query.city_id) {
      whereStatement.city_id = req.query.city_id;
    } else if (req.query.region_id) {
      whereStatement.region_id = req.query.region_id;
    } else if (req.query.country_id)
      whereStatement.country_id = req.query.country_id;

    const properties = await Property.scope('public').findAll({
      where: whereStatement,
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
    });

    if (Object.keys(properties).length === 0) {
      return res.status(404).json({ message: 'No properties found' });
    }

    return res.status(200).json(properties);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting property list' });
  }
};

exports.roomList = async (req, res) => {
  try {
    if (!req.query.propertyId) {
      return res.status(400).json({ message: 'Provide a propertyId' });
    }

    const property = await Property.findByPk(req.query.propertyId);

    if (!property) {
      return res.status(404).json({ message: 'No property found' });
    }

    const rooms = await property.getRooms({
      include: [
        {
          model: Picture,
          as: 'Pictures',
          limit: 1,
        },
      ],
    });

    if (Object.keys(rooms).length === 0) {
      return res.status(404).json({ message: 'No rooms found' });
    }

    return res.status(200).json(rooms);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting room list' });
  }
};

exports.getRoom = async (req, res) => {
  try {
    if (!req.query.roomId) {
      return res.status(400).json({ message: 'Provide a roomId' });
    }

    const room = await Room.scope('public').findByPk(req.query.roomId, {
      include: [
        {
          model: Picture,
          as: 'Pictures',
        },
      ],
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.status(200).json(room);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting room' });
  }
};

exports.bookingList = async (req, res) => {
  try {
    if (!req.query.from || !req.query.duration || !req.query.roomId)
      return res.status(400).json({
        message: 'Provide valid from date, duration in months, and a roomId ',
      });

    const currentDate = new Date();

    if (currentDate > Date.parse(req.query.from)) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const room = await Room.scope('public').findByPk(req.query.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const toDate =
      Date.parse(req.query.from) +
      parseInt(req.query.duration, 10) * 2629743000;

    const bookingDates = [];
    for (
      let adate = Date.parse(req.query.from);
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

    return res.status(200).json(unavailabledates);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting booked dates' });
  }
};

// Location
exports.getCity = async (req, res) => {
  try {
    if (!req.query.city_id) {
      return res.status(400).json({ message: 'Provide a city_id' });
    }

    const city = await City.findByPk(req.query.city_id);

    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    return res.status(200).json(city);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting city' });
  }
};

exports.cityList = async (req, res) => {
  try {
    if (!req.query.region_id) {
      return res.status(400).json({ message: 'Provide a region_id' });
    }

    const cities = await City.findAll({
      where: {
        region_id: req.query.region_id,
      },
    });

    if (!cities || Object.keys(cities).length === 0) {
      return res.status(404).json({ message: 'No city found' });
    }

    return res.status(200).json(cities);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting city list' });
  }
};

exports.getRegion = async (req, res) => {
  try {
    if (!req.query.region_id) {
      return res.status(400).json({ message: 'Provide a region_id' });
    }

    const region = await Region.findByPk(req.query.region_id);

    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    return res.status(200).json(region);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting region' });
  }
};

exports.regionList = async (req, res) => {
  try {
    if (!req.query.country_id) {
      return res.status(400).json({ message: 'Provide a country_id' });
    }

    const regions = await Region.findAll({
      where: {
        country_id: req.query.country_id,
      },
    });

    if (!regions || Object.keys(regions).length === 0) {
      return res.status(404).json({ message: 'No region found' });
    }

    return res.status(200).json(regions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting region list' });
  }
};

exports.getCountry = async (req, res) => {
  try {
    if (!req.query.country_id) {
      return res.status(400).json({ message: 'Provide a country_id' });
    }

    const country = await Country.findByPk(req.query.country_id);

    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    return res.status(200).json(country);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting country' });
  }
};

exports.countryList = async (req, res) => {
  try {
    const countries = await Country.findAll();

    if (!countries || Object.keys(countries).length === 0) {
      return res.status(404).json({ message: 'No country found' });
    }

    return res.status(200).json(countries);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting country list' });
  }
};
