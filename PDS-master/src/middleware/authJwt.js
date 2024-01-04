const jwt = require('jsonwebtoken');
const db = require('../models');

const User = db.user;
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).json({
      message: 'No token provided!',
    });
  }
  jwt.verify(token, process.env.AUTH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: 'Unauthorized!',
      });
    }
    req.userId = decoded.userId;
    next();
    return false;
  });
  return false;
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    if (Object.keys(roles).length !== 0) {
      for (let i = 0; i < roles.length; i += 1) {
        if (roles[i].name === 'admin') {
          next();
          return;
        }
      }
    }

    res.status(403).json({
      message: 'Admin Role required!',
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
const isStudent = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user) {
      const roles = await user.getRoles();

      if (Object.keys(roles).length !== 0) {
        let roleStudent = false;
        for (let i = 0; i < roles.length; i += 1) {
          if (roles[i].name === 'student') {
            roleStudent = true;
          }
        }
        if (roleStudent) {
          const student = await user.getStudent();
          req.studentId = student.studentId;
          next();
          return;
        }
      }
    }
    res.status(403).json({
      message: 'Student Role required!',
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
const isSeller = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user) {
      const roles = await user.getRoles();

      if (Object.keys(roles).length !== 0) {
        let roleSeller = false;
        for (let i = 0; i < roles.length; i += 1) {
          if (roles[i].name === 'seller') {
            roleSeller = true;
          }
        }
        if (roleSeller) {
          const seller = await user.getSeller();
          req.sellerId = seller.sellerId;
          next();
          return;
        }
      }
    }
    res.status(403).json({
      message: 'Seller Role required!',
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
const authJwt = {
  verifyToken,
  isAdmin,
  isStudent,
  isSeller,
};
module.exports = authJwt;
