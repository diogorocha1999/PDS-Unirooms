const fs = require('fs');
const db = require('../models');

const Property = db.property;
const Picture = db.picture;
const Room = db.room;
const { Op } = db.Sequelize;

exports.addRoom = async (req, res) => {
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

    const room = await property.createRoom({
      bed_number: req.body.bed_number,
      wc: req.body.wc,
      hvac: req.body.hvac,
      desk: req.body.desk,
      wardrobe: req.body.wardrobe,
      kitchen: req.body.kitchen,
      description: req.body.description,
      monthly_fee: req.body.monthly_fee,
      enabled: req.body.enabled,
    });

    return res.status(201).json(room);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error adding room' });
  }
};

exports.getRoom = async (req, res) => {
  try {
    if (!req.query.roomId) {
      return res.status(400).json({ message: 'Provide a roomId' });
    }

    const room = await Room.findByPk(req.query.roomId, {
      where: {
        [Op.or]: [
          { '$Property.ownerId$': req.sellerId },
          { '$Property.resellerId$': req.sellerId },
        ],
      },
      include: [
        {
          model: Property,
          required: false,
          as: 'Property',
          attributes: [],
        },
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

exports.updateRoom = async (req, res) => {
  try {
    if (!req.body.roomId) {
      return res.status(400).json({ message: 'Provide a roomId' });
    }

    const room = await Room.findByPk(req.body.roomId, {
      where: {
        '$Property.ownerId$': req.sellerId,
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
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.update({
      bed_number: req.body.bed_number,
      wc: req.body.wc,
      hvac: req.body.hvac,
      desk: req.body.desk,
      wardrobe: req.body.wardrobe,
      kitchen: req.body.kitchen,
      description: req.body.description,
      monthly_fee: req.body.monthly_fee,
    });

    return res.status(200).json(room);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating room' });
  }
};

exports.removeRoom = async (req, res) => {
  try {
    if (!req.body.roomId) {
      return res.status(400).json({ message: 'Provide a roomId' });
    }

    const room = await Room.findByPk(req.body.roomId, {
      where: {
        '$Property.ownerId$': req.sellerId,
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
      return res.status(404).json({ message: 'Room not found' });
    }

    const hasRentals = await room.countRentals();

    if (hasRentals > 0) {
      return res.status(403).json({
        message:
          "You can't delete a room with rental history, try to disable it.",
      });
    }

    const pictures = room.getPictures();

    if (Object.keys(pictures).length !== 0) {
      await pictures.forEach((picture) => {
        fs.unlinkSync(`.${picture.url}`);
      });
    }

    room.destroy();

    return res.status(200).send({ message: 'Room Deleted.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error removing room' });
  }
};

exports.enableRoom = async (req, res) => {
  try {
    if (!req.body.roomId) {
      return res.status(400).json({ message: 'Provide a roomId' });
    }

    const room = await Room.findOne({
      where: {
        '$Property.ownerId$': req.sellerId,
        roomId: req.body.roomId,
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
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.update({
      enabled: true,
    });

    return res.status(200).send({ message: 'Room Enabled.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error enabling property' });
  }
};

exports.disableRoom = async (req, res) => {
  try {
    if (!req.body.roomId) {
      return res.status(400).json({ message: 'Provide a roomId' });
    }

    const room = await Room.findOne({
      where: {
        '$Property.ownerId$': req.sellerId,
        roomId: req.body.roomId,
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
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.update({
      enabled: false,
    });

    return res.status(200).send({ message: 'Room Disabled.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error disabling room' });
  }
};

exports.roomList = async (req, res) => {
  try {
    if (!req.query.propertyId) {
      return res.status(400).json({ message: 'Provide a propertyId' });
    }

    const property = await Property.findByPk(req.query.propertyId, {
      where: {
        [Op.or]: [{ ownerId: req.sellerId }, { resellerId: req.sellerId }],
      },
    });

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
