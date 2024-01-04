const db = require('../models');

const Delegation = db.delegation;
const { Op } = db.Sequelize;
const Property = db.property;
const Seller = db.seller;

exports.addDelegation = async (req, res) => {
  try {
    if (!req.body.propertyId || !req.body.resellerId || !req.body.fee) {
      return res
        .status(400)
        .json({ message: 'Provide a propertyId, resellerId and fee' });
    }

    if (req.sellerId === req.body.resellerId) {
      return res.status(403).json({ message: "Can't self delegate." });
    }

    const reseller = await Seller.findByPk(req.body.resellerId);

    if (!reseller) {
      return res
        .status(404)
        .json({ message: 'No seller matches your resellerId' });
    }

    const property = await Property.findByPk(req.body.propertyId, {
      where: { ownerId: req.sellerId },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const delegation = await property.createDelegation({
      ownerId: property.ownerId,
      resellerId: req.body.resellerId,
      fee: req.body.fee,
      authorized: false,
    });

    return res.status(201).json(delegation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating delegation' });
  }
};

exports.updateDelegation = async (req, res) => {
  try {
    if (!req.body.delegationId || !req.body.fee) {
      return res
        .status(400)
        .json({ message: 'Provide a delegationId and fee' });
    }

    const delegation = await Delegation.findByPk(req.body.delegationId, {
      where: { ownerId: req.sellerId },
    });

    if (!delegation) {
      return res.status(404).json({ message: 'Delegation not found' });
    }

    await delegation.update({
      fee: req.body.fee,
      authorized: false,
    });

    await Property.update(
      {
        resellerId: null,
      },
      {
        where: { ownerId: req.sellerId },
      }
    );

    return res.status(200).json(delegation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating delegation' });
  }
};

exports.approveDelegation = async (req, res) => {
  try {
    if (!req.body.delegationId) {
      return res
        .status(400)
        .json({ message: 'Provide a delegationId and fee' });
    }

    const delegation = await Delegation.findByPk(req.body.delegationId, {
      where: { resellerId: req.sellerId },
    });

    if (!delegation) {
      return res.status(404).json({ message: 'Delegation not found' });
    }

    await delegation.update({
      authorized: true,
    });

    await Property.update(
      {
        resellerId: req.sellerId,
      },
      {
        where: { ownerId: delegation.ownerId },
      }
    );

    return res.status(200).json({ message: 'Delegation updated.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating delegation' });
  }
};

exports.removeDelegation = async (req, res) => {
  try {
    if (!req.body.delegationId) {
      return res.status(400).json({ message: 'Provide a delegationId ' });
    }

    const delegation = await Delegation.findByPk(req.body.delegationId, {
      where: {
        [Op.or]: [{ resellerId: req.sellerId }, { ownerId: req.sellerId }],
      },
    });

    if (!delegation) {
      return res.status(404).json({ message: 'Delegation not found' });
    }

    await delegation.destroy();

    await Property.update(
      {
        resellerId: null,
      },
      {
        where: { ownerId: delegation.ownerId },
      }
    );

    return res.status(200).json({ message: 'Delegation updated.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating delegation' });
  }
};

exports.getDelegation = async (req, res) => {
  try {
    if (!req.query.delegationId) {
      return res.status(400).json({ message: 'Provide a delegationId ' });
    }

    const delegation = await Delegation.findByPk(req.query.delegationId, {
      where: {
        [Op.or]: [{ resellerId: req.sellerId }, { ownerId: req.sellerId }],
      },
    });

    if (!delegation) {
      return res.status(404).json({ message: 'Delegation not found' });
    }

    return res.status(200).json(delegation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting delegation' });
  }
};

exports.createdDelegationList = async (req, res) => {
  try {
    const createdDelegations = await Delegation.findAll({
      where: {
        ownerId: req.sellerId,
      },
    });

    if (!createdDelegations) {
      return res.status(404).json({ message: 'No created delegation found' });
    }

    return res.status(200).json(createdDelegations);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error getting created delegation list' });
  }
};

exports.assignedDelegationList = async (req, res) => {
  try {
    const assignedDelegations = await Delegation.findAll({
      where: {
        resellerId: req.sellerId,
      },
    });

    if (!assignedDelegations) {
      return res.status(404).json({ message: 'No delegation found' });
    }

    return res.status(200).json(assignedDelegations);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error getting assigned delegation list' });
  }
};
