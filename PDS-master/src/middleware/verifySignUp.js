const db = require('../models');

const { ROLES } = db;
const User = db.user;
const Role = db.role;

const checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((user) => {
      if (user) {
        res.status(400).json({
          message: 'Failed! Username is already in use!',
        });
        return;
      }
      // Email
      User.findOne({
        where: {
          email: req.body.email,
        },
      }).then((suser) => {
        if (suser) {
          res.status(400).json({
            message: 'Failed! Email is already in use!',
          });
          return;
        }
        next();
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error checking username and password' });
    });
};

const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i += 1) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).json({
          message: `Failed! Role does not exist = ${req.body.roles[i]}`,
        });
        return;
      }
    }
  }
  next();
};

const checkAdminExisted = (req, res, next) => {
  if (req.body.roles) {
    if (req.body.roles.indexOf('admin') > -1) {
      Role.findOne({
        where: {
          name: 'admin',
        },
        include: [
          {
            model: User,
            through: { attributes: [] },
            as: 'Users',
          },
        ],
      })
        .then((admin) => {
          if (
            undefined !== admin.Users &&
            Object.keys(admin.Users).length !== 0
          ) {
            res.status(400).json({
              message: 'Only an admin can add more admins!',
            });
            return;
          }
          next();
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: 'Error checking for an admin' });
        });
      return;
    }
  }
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted,
  checkAdminExisted,
};
module.exports = verifySignUp;
