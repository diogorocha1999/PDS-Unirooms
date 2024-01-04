const db = require('../models');

const Payout = db.payout;
const Property = db.property;
const Delegation = db.delegation;
const SystemSettings = db.systemsettings;
const Payment = db.payment;
const Rental = db.rental;
const Room = db.room;
const { Op } = db.Sequelize;

// To do: payment info should be encrypted and sent securely (possibly not even saving it)

// Student
exports.pay = async (req, res) => {
  try {
    if (!req.body.rentalId)
      return res.status(400).json({ message: 'Provide a valid rentalId' });

    if (req.body.payType < 0 || req.body.payType > 3)
      return res.status(400).json({ message: 'Provide a valid payType' });

    const rental = await Rental.findByPk(req.body.rentalId, {
      where: { studentId: req.studentId },
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (
      rental.rental_status === 2 ||
      rental.rental_status === 3 ||
      rental.rental_status === 5
    ) {
      return res
        .status(400)
        .json({ message: 'This rental is no longer valid' });
    }

    if (rental.rental_status === 4 && rental.payment_status === 3) {
      return res
        .status(400)
        .json({ message: 'This rental is already fully paid' });
    }

    let payamount = 0.00;

    // Pay Deposit
    if (req.body.payType === 0) {
      if (
        rental.rental_status !== 0 ||
        rental.payment_status !== 0
      ) {
        return res.status(400).json({ message: 'Invalid operation' });
      }

      const systemsettings = await SystemSettings.findByPk(1);

      // Calculate deposit amount
      payamount = rental.monthly_fee * (systemsettings.depositFee / 100); // Deposit fee

      // Pay Monthly Rental Fee
    } else if (req.body.payType === 1) {
      if (rental.rental_status !== 1 || rental.payment_status !== 1) {
        return res.status(400).json({ message: 'Invalid operation' });
      }

      // check if it's the last payment
      const paymentcount = await rental.countPayments({
        where: {
          type: 1,
          status: 1,
        },
      });

      const lastpayment =
        rental.duration ===
        paymentcount
          ? 'true'
          : 'false';

          console.log(lastpayment)
      if (lastpayment === true) {
        const deposit = await rental.getPayments({
          where: {
            [Op.and]: [{ type: 0 }, { status: 1 }],
          },
          limit: 1,
        });
        console.log('HErre')
        payamount = rental.monthly_fee - deposit.amount; // Substracting the deposit fee
        req.body.payType = 3; // rental termination
      } else {
        payamount = rental.monthly_fee;
      }
    } else {
      if (!req.body.amount) {
        return res.status(400).json({ message: 'Provide a valid amount' });
      }
      payamount = req.body.amount;
    }

    console.log(payamount)
    console.log(parseFloat(payamount))

    const payment = await Payment.scope('withCreditCard').create({
      card_number: req.body.card_number,
      card_owner: req.body.card_owner,
      ccv: req.body.ccv,
      amount: parseFloat(payamount),
      type: req.body.payType,
      status: 0,
      rentalId: rental.rentalId,
    });
    const paymentdetails = {
      payId: payment.paymentId,
      amount: payment.amount,
      createdAt: payment.createdAt,
    };

    return res.status(201).json({ paymentdetails });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error while initiating payment' });
  }
};

exports.listPaymentsStudent = async (req, res) => {
  try {
    if (!req.query.rentalId)
      return res.status(400).json({ message: 'Provide a valid rentalId' });

    const rental = await Rental.findByPk(req.query.rentalId, {
      where: { studentId: req.studentId },
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    const payments = await rental.getPayments();

    return res.status(200).json(payments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting the payment list' });
  }
};

// Payment API (lacking proper integration)
exports.confirmPayment = async (req, res) => {
  // This should be protected by a secret/token (lacking payment API integration)
  try {
    if (!req.body.paymentId)
      return res.status(400).json({ message: 'Provide a valid paymentId' });

    const payment = await Payment.findByPk(req.body.paymentId);

    // Confirm payment
    await payment.update({
      status: 1,
    });

    const rental = await payment.getRental();

    // Update rental
    if (payment.type === 0 || payment.type === 1 || payment.type === 3) {
      // Check payment type
      if (payment.type === 0) {
        // Deposit
        await rental.update({
          payment_status: 1,
          rental_status: 1,
        });
      } else if (payment.type === 1) {
        // Rental fee
        // check if there are still missing payments
        const monthlyfeecount = await rental.countPayments({
          where: {
            type: 1,
            status: 1,
          },
        });
        const currentDate = new Date();
        let paymentstatus = 1; // ok status
        if (
          currentDate.getUTCMonth() - rental.from.getUTCMonth() >
            monthlyfeecount &&
          currentDate.getUTCDay() > rental.from.getUTCDay()
        ) {
          paymentstatus = 2; // missing payments
        }
        await rental.update({
          payment_status: paymentstatus,
          rental_status: 1,
        });
      } else if (payment.type === 3) {
        // Final payment
        await rental.update({
          payment_status: 3,
        });
      }
    }

    // Seller Payouts
    const roominfo = await rental.getRoom({
      include: {
        model: Property,
        as: 'Property',
        attributes: {
          include: ['propertyId', 'ownerId', 'resellerId'],
        },
        include: {
          model: Delegation,
          as: 'Delegation',
          attributes: {
            include: ['fee'],
          },
        },
      },
    });

    const systemsettings = await SystemSettings.findByPk(1);
    let delegationfee = 0;

    // Pay reseller
    if (roominfo.resellerId) {
      delegationfee = roominfo.Property.Delegation.fee;
      const resellerPayout = payment.amount * (delegationfee / 100);
      await Payout.create({
        type: 1,
        system_fee: systemsettings.transactionFee,
        delegation_fee: delegationfee,
        full_amount: payment.amount,
        paid_amount: resellerPayout,
        status: 0,
        sellerId: roominfo.Property.ownerId,
        paymentId: payment.paymentId,
      });
    }

    const ownerpayout =
      payment.amount *
      (1 - systemsettings.transactionFee / 100 - delegationfee / 100); // subtract fees
    await Payout.create({
      type: 0,
      system_fee: systemsettings.transactionFee,
      full_amount: payment.amount,
      paid_amount: ownerpayout,
      status: 0,
      sellerId: roominfo.Property.ownerId,
      paymentId: payment.paymentId,
    });

    return res.status(200).json({ message: 'Payment Confirmed.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unable to confirm payment' });
  }
};

exports.voidPayment = async (req, res) => {
  // This should be protected by a secret/token (lacking payment API integration)
  try {
    if (!req.body.paymentId)
      return res.status(400).json({ message: 'Provide a valid paymentId' });

    const payment = await Payment.findByPk(req.body.paymentId);

    if (payment.status === 1) {
      return res
        .status(400)
        .json({ message: 'Error: This payment was already processed' });
    }
    await payment.update({
      status: 2,
    });

    return res.status(200).json({ message: 'Payment voided.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unable to void the payment.' });
  }
};

// Seller
exports.listPaymentsSeller = async (req, res) => {
  try {
    if (!req.query.rentalId)
      return res.status(400).json({ message: 'Provide a valid rentalId' });

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
      return res.status(404).json({ message: 'Rental not found' });
    }

    const payments = await rental.getPayments();

    return res.status(200).json(payments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error getting the payment list' });
  }
};
