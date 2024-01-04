const fs = require('fs');
const db = require('../models');

const Property = db.property;
const Picture = db.picture;
const Room = db.room;
const { Op } = db.Sequelize;

exports.addPictures = async (req, res) => {
  try {
    if (!req.query.roomId) {
      return res.status(400).json({ message: 'Provide a roomId' });
    }
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'Provide the picture files' });
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
      ],
    });

    if (!room) {
      req.files.forEach((file) => {
        fs.unlinkSync(`./uploads/${file.filename}`);
      });
      return res.status(404).json({ message: 'Room not found' });
    }

    await req.files.forEach(async (file) => {
      await Picture.create({
        url: `/uploads/${file.filename}`,
        roomId: room.roomId,
      });
    });

    const pictures = await Picture.findAll({
      where: {
        roomId: room.roomId,
      },
    });
    return res.status(201).json(pictures);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error adding picture' });
  }
};

exports.getPicture = async (req, res) => {
  try {
    if (!req.query.pictureId) {
      return res.status(400).json({ message: 'Provide a pictureId' });
    }

    const picture = await Picture.findOne({
      where: {
        [Op.or]: [
          { '$Room.Property.ownerId$': req.sellerId },
          { '$Room.Property.resellerId$': req.sellerId },
        ],
        pictureId: req.query.pictureId,
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

    if (!picture) {
      return res.status(404).json({ message: 'Picture not found' });
    }

    return res.status(200).json(picture);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting picture' });
  }
};

exports.listPictures = async (req, res) => {
  try {
    if (!req.query.roomId) {
      return res.status(400).json({ message: 'Provide a roomId' });
    }

    const pictures = await Picture.findAll({
      where: {
        [Op.or]: [
          { '$Room.Property.ownerId$': req.sellerId },
          { '$Room.Property.resellerId$': req.sellerId },
        ],
        roomId: req.query.roomId,
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

    if (!pictures || Object.keys(pictures).length === 0) {
      return res.status(404).json({ message: 'No pictures found' });
    }

    return res.status(200).json(pictures);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting picture list' });
  }
};

exports.removePicture = async (req, res) => {
  try {
    if (!req.body.pictureId) {
      return res.status(400).json({ message: 'Provide a pictureId' });
    }

    const picture = await Picture.findOne({
      where: {
        [Op.or]: [
          { '$Room.Property.ownerId$': req.sellerId },
          { '$Room.Property.resellerId$': req.sellerId },
        ],
        pictureId: req.body.pictureId,
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

    if (!picture) {
      return res.status(404).json({ message: 'Picture not found' });
    }

    fs.unlinkSync(`.${picture.url}`);

    await picture.destroy();

    return res.status(200).send({ message: 'Picture Deleted.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error removing picture' });
  }
};
