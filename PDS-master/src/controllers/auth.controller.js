// - signup: create new User in database (role is user if not specifying role)
// - signin:
//      find username of the request in database, if it exists
//      compare password with password in database using bcrypt, if it is correct
//      generate a token using jsonwebtoken
//      return user information & access Token

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = require('../models');

const sendEmail = require('../utils/sendEmail');

const User = db.user;
const Role = db.role;
const { QueryTypes } = db.Sequelize;

exports.signup = async (req, res) => {
  try {
    // Check for existing admin in case the role admin is provided
    let adminRole = false;
    let sellerRole = false;
    let studentRole = false;

    if (req.body.roles) {
      if (req.body.roles.indexOf('admin') > -1) {
        const admin = await User.findOne({
          where: {
            '$Roles.name$': 'admin',
          },
          attributes: ['id'],
          through: { attributes: [] },
          include: [
            {
              model: Role,
              attributes: ['name'],
              as: 'Roles',
            },
          ],
        });
        if (admin) {
          return res
            .status(403)
            .json({ message: 'Only the current admin can add more admins!' });
        }
        adminRole = true;
      }

      if (req.body.roles.indexOf('student') > -1) {
        // student
        if (!req.body.school_name || !req.body.school_email) {
          return res.status(400).json({ message: 'Student details missing!' });
        }
        studentRole = true;
      }
      // seller
      if (req.body.roles.indexOf('seller') > -1) {
        if (!req.body.iban) {
          return res.status(400).json({ message: 'Seller details missing!' });
        }
        sellerRole = true;
      }
    }

    // Save User to Database
    const user = await User.scope('withPassword').create({
      username: req.body.username.toLowerCase(),
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    // Roles
    // user role = 1
    await user.addRole(1);
    if (req.body.roles) {
      // student
      if (studentRole) {
        await user.addRole(4);
        await user.createStudent({
          school_name: req.body.school_name,
          school_email: req.body.school_email,
        });
      }
      // seller
      if (sellerRole) {
        await user.addRole(3);
        await user.createSeller({
          iban: req.body.iban,
        });
      }
      // admin
      if (adminRole) {
        await user.addRole(2);
      }
    }

    // User Info
    await user.createUserInfo({
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

    return res
      .status(201)
      .json({ message: 'User was registered successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error while trying to sign up' });
  }
};

exports.signin = (req, res) => {
  User.scope('withPassword')
    .findOne({
      where: {
        username: req.body.username.toLowerCase(),
      },
    })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User Not found.' });
      }
      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).json({
          accessToken: null,
          message: 'Invalid Password!',
        });
      }
      if (user.enabled === false) {
        return res.status(405).json({
          accessToken: null,
          message: 'Forbidden! User account disabled',
        });
      }
      const token = jwt.sign({ userId: user.userId }, process.env.AUTH_SECRET, {
        expiresIn: 86400, // 24 hours
      });
      const authorities = [];
      user.getRoles().then((roles) => {
        for (let i = 0; i < roles.length; i += 1) {
          authorities.push(`ROLE_${roles[i].name.toUpperCase()}`);
        }
        res.status(200).json({
          userId: user.userId,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token,
        });
      });
      return false;
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error while trying to sign in' });
    });
};

exports.signout = (req, res) => {
  const token = req.headers['x-access-token'];
  jwt.sign(token, '', { expiresIn: 1 }, (signout) => {
    if (signout) {
      res.status(200).json({ message: 'Signed Out Successfully' });
    } else {
      res.status(500).json({ message: 'Error while trying to Sign Out' });
    }
  });
};

exports.pwresetrequest = async (req, res) => {
  try {
    const sentmessage =
      'In case the email exists, a password reset link was sent.';
    if (!req.body.email) {
      return res.status(400).json({
        message: 'An email address needs to be provided!',
      });
    }

    const user = await User.scope('withPassword').findOne({
      where: {
        email: req.body.email,
      },
    });
    if (!user) {
      return res.status(202).json({ message: sentmessage });
    }

    const payload = {
      userId: user.userId,
      email: user.email,
    };

    const userCD = await db.sequelize.query(
      'SELECT createdAt FROM `Users` WHERE userID = ?',
      {
        replacements: [user.userId],
        type: QueryTypes.SELECT,
      }
    );

    const prsecret = `${user.password}-${userCD}`;

    const token = jwt.sign(payload, prsecret, {
      expiresIn: 86400, // 24 hours
    });

    const link = `${process.env.APP_BASEPROTOCOL}://${process.env.APP_FULLURL}/api/auth/passwordreset/${user.userId}/${token}`;

    await sendEmail(user.email, 'Password reset', link);

    return res.status(202).json({ message: sentmessage });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error requesting a password reset' });
  }
};

exports.resetpasswordform = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = parseInt(req.params.id, 10);
    let decodedID = 0;

    if (!token) {
      return res.status(403).json({
        message: 'No token provided!',
      });
    }

    if (!userId) {
      return res.status(403).json({
        message: 'No user provided!',
      });
    }

    const user = await User.scope('withPassword').findByPk(userId);
    if (!user) {
      return res.status(500).json({ message: 'User not found' });
    }

    const userCD = await db.sequelize.query(
      'SELECT createdAt FROM `Users` WHERE userID = ?',
      {
        replacements: [user.userId],
        type: QueryTypes.SELECT,
      }
    ); //  get user creation date

    const prsecret = `${user.password}-${userCD}`;

    jwt.verify(token, prsecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: 'Unauthorized!',
        });
      }

      decodedID = decoded.userId;

      return false;
    });

    if (decodedID !== userId) {
      return res.status(401).json({
        message: 'Unauthorized!',
      });
    }

    return res.status(201)
      .send(`<form action="/api/auth/passwordreset/set" method="POST">
        <input type="hidden" name="userId" value="${decodedID}" />
        <input type="hidden" name="token" value="${token}" />
        <input type="password" name="password" value="" placeholder="Enter your new password..." />
        <input type="submit" value="Reset Password" />
    </form>`);
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error creating the password reset form' });
  }
};

exports.setnewpassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.body;
    const userId = parseInt(req.body.userId, 10);
    let decodedID = 0;

    if (!token) {
      return res.status(403).json({
        message: 'No token provided!',
      });
    }

    if (!password) {
      return res.status(400).json({
        message: 'A password needs to be provided!',
      });
    }

    const user = await User.scope('withPassword').findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userCD = await db.sequelize.query(
      'SELECT createdAt FROM `Users` WHERE userID = ?',
      {
        replacements: [user.userId],
        type: QueryTypes.SELECT,
      }
    ); //  get user creation date

    const prsecret = `${user.password}-${userCD}`;

    jwt.verify(token, prsecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: 'Unauthorized!',
        });
      }
      decodedID = decoded.userId;
      return false;
    });

    if (decodedID !== userId) {
      return res.status(401).json({
        message: 'Unauthorized!',
      });
    }

    //  save new password
    user.password = bcrypt.hashSync(password, 8);
    await user.save();

    return res.status(200).json({ message: 'New password set' });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating the password' });
  }
};
