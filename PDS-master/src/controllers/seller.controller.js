const db = require('../models');

const Seller = db.seller;
const Payout = db.payout;
const { Op } = db.Sequelize;

exports.getSeller = async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.sellerId);

    return res.status(200).json(seller);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error retrieving seller information' });
  }
};

exports.updateSeller = async (req, res) => {
  try {
    if (!req.body.iban) {
      return res.status(400).json({ message: 'Provide an IBAN' });
    }
    const seller = await Seller.update(
      {
        iban: req.body.iban,
      },
      {
        where: {
          sellerId: req.sellerId,
        },
      }
    );

    return res.status(200).json(seller);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating seller' });
  }
};

exports.getPayout = async (req, res) => {
  try {
    if (!req.query.payoutId)
      return res.status(500).json({ message: 'Provide a valid payoutId' });

    const payout = await Payout.findOne({
      where: {
        [Op.and]: [
          { sellerId: req.sellerId },
          { payoutId: req.query.payoutId },
        ],
      },
    });

    if (!payout) {
      return res
        .status(404)
        .json({ message: 'No Payout with that Id was found' });
    }

    return res.status(200).json(payout);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error getting payout information' });
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
          { sellerId: req.sellerId },
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
    console.error(err);
    return res.status(500).json({ message: 'Error getting payout list' });
  }
};
