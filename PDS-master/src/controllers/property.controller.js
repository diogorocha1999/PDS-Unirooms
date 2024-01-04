const db = require('../models');

const Property = db.property;
const Rental = db.rental;
const City = db.city;
const Region = db.region;
const Country = db.country;
const { Op } = db.Sequelize;

exports.addProperty = async (req, res) => {
  try {
    const property = await Property.create({
      type: req.body.type,
      address: req.body.address,
      address2: req.body.address2,
      postcode: req.body.postcode,
      city_id: req.body.city_id,
      region_id: req.body.region_id,
      country_id: req.body.country_id,
      ownerId: req.sellerId,
    });
    return res.status(201).json(property);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error adding property' });
  }
};

exports.getProperty = async (req, res) => {
  try {
    if (!req.query.propertyId) {
      return res.status(400).json({ message: 'Provide a propertyId' });
    }

    const property = await Property.findByPk(req.query.propertyId, {
      where: {
        [Op.or]: [{ ownerId: req.sellerId }, { resellerId: req.sellerId }],
      },
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

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    return res.status(200).json(property);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting property' });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    if (!req.body.propertyId) {
      return res.status(400).json({ message: 'Provide a propertyId' });
    }

    const property = await Property.findByPk(req.body.propertyId, {
      where: {
        ownerId: req.sellerId,
      },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await property.update({
      type: req.body.type,
      address: req.body.address,
      address2: req.body.address2,
      postcode: req.body.postcode,
      city_id: req.body.city_id,
      region_id: req.body.region_id,
      country_id: req.body.country_id,
      enabled: req.body.enabled,
    });
    return res.status(200).json(property);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating property' });
  }
};

exports.removeProperty = async (req, res) => {
  try {
    if (!req.body.propertyId) {
      return res.status(400).json({ message: 'Provide a propertyId' });
    }

    const property = await Property.findByPk(req.body.propertyId, {
      where: {
        ownerId: req.sellerId,
      },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const hasRentals = await property.getRooms({
      include: [
        {
          model: Rental,
          required: true,
          as: 'Rentals',
        },
      ],
    });

    if (Object.keys(hasRentals).length !== 0) {
      return res.status(403).json({
        message:
          "You can't delete a property with rental history, try to disable it.",
      });
    }

    property.destroy();

    return res.status(200).send({ message: 'Property Deleted.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error removing property' });
  }
};

exports.enableProperty = async (req, res) => {
  try {
    if (!req.body.propertyId) {
      return res.status(400).json({ message: 'Provide a propertyId' });
    }

    const property = await Property.findByPk(req.body.propertyId, {
      where: {
        ownerId: req.sellerId,
      },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await property.update({
      enabled: true,
    });

    return res.status(200).send({ message: 'Property Enabled.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error enabling property' });
  }
};

exports.disableProperty = async (req, res) => {
  try {
    if (!req.body.propertyId) {
      return res.status(400).json({ message: 'Provide a propertyId' });
    }

    const property = await Property.findByPk(req.body.propertyId, {
      where: {
        ownerId: req.sellerId,
      },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
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

    return res.status(200).send({ message: 'Property Disabled.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error disabling property' });
  }
};

exports.propertyList = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: {
        [Op.or]: [{ ownerId: req.sellerId }, { resellerId: req.sellerId }],
      },
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
