const Sequelize = require('sequelize');

const dbEnv = [];
if (process.env.NODE_ENV.trim() === 'development') {
  dbEnv.database = process.env.D_DB_DATABASE;
  dbEnv.user = process.env.D_DB_USER;
  dbEnv.password = process.env.D_DB_PASSWORD;
  dbEnv.host = process.env.D_DB_HOST;
  dbEnv.dialect = process.env.D_DB_DIALECT;
  dbEnv.operatorsAliases = parseInt(process.env.D_DB_OPERATORALIASES, 10);
  dbEnv.max = parseInt(process.env.D_DB_MAX, 10);
  dbEnv.min = parseInt(process.env.D_DB_MIN, 10);
  dbEnv.acquire = parseInt(process.env.D_DB_ACQUIRE, 10);
  dbEnv.idle = parseInt(process.env.D_DB_IDLE, 10);
} else if (process.env.NODE_ENV.trim() === 'test') {
  dbEnv.database = process.env.T_DB_DATABASE;
  dbEnv.user = process.env.T_DB_USER;
  dbEnv.password = process.env.T_DB_PASSWORD;
  dbEnv.host = process.env.T_DB_HOST;
  dbEnv.dialect = process.env.T_DB_DIALECT;
  dbEnv.operatorsAliases = parseInt(process.env.T_DB_OPERATORALIASES, 10);
  dbEnv.max = parseInt(process.env.T_DB_MAX, 10);
  dbEnv.min = parseInt(process.env.T_DB_MIN, 10);
  dbEnv.acquire = parseInt(process.env.T_DB_ACQUIRE, 10);
  dbEnv.idle = parseInt(process.env.T_DB_IDLE, 10);
} else {
  dbEnv.database = process.env.P_DB_DATABASE;
  dbEnv.user = process.env.P_DB_USER;
  dbEnv.password = process.env.P_DB_PASSWORD;
  dbEnv.host = process.env.P_DB_HOST;
  dbEnv.dialect = process.env.P_DB_DIALECT;
  dbEnv.operatorsAliases = parseInt(process.env.P_DB_OPERATORALIASES, 10);
  dbEnv.max = parseInt(process.env.P_DB_MAX, 10);
  dbEnv.min = parseInt(process.env.P_DB_MIN, 10);
  dbEnv.acquire = parseInt(process.env.P_DB_ACQUIRE, 10);
  dbEnv.idle = parseInt(process.env.P_DB_IDLE, 10);
}

const sequelize = new Sequelize(dbEnv.database, dbEnv.user, dbEnv.password, {
  host: dbEnv.host,
  dialect: dbEnv.dialect,
  operatorsAliases: dbEnv.operatorsAliases,
  pool: {
    max: dbEnv.max,
    min: dbEnv.min,
    acquire: dbEnv.acquire,
    idle: dbEnv.idle,
  },
  logging: false, // disable logging; default: console.log
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.conversation = require('../models/conversation.model')(sequelize, Sequelize);
db.delegation = require('../models/delegation.model')(sequelize, Sequelize);
db.message = require('../models/message.model')(sequelize, Sequelize);
db.payment = require('../models/payment.model')(sequelize, Sequelize);
db.picture = require('../models/picture.model')(sequelize, Sequelize);
db.property = require('../models/property.model')(sequelize, Sequelize);
db.rental = require('../models/rental.model')(sequelize, Sequelize);
db.bookeddate = require('./bookeddate.model')(sequelize, Sequelize);
db.role = require('../models/role.model')(sequelize, Sequelize);
db.room = require('../models/room.model')(sequelize, Sequelize);
db.seller = require('../models/seller.model')(sequelize, Sequelize);
db.payout = require('../models/payout.model')(sequelize, Sequelize);
db.student = require('../models/student.model')(sequelize, Sequelize);
db.systemsettings = require('../models/systemsettings.model')(
  sequelize,
  Sequelize
);
db.user = require('../models/user.model')(sequelize, Sequelize);
db.userinfo = require('../models/userinfo.model')(sequelize, Sequelize);
db.country = require('../models/country.model')(sequelize, Sequelize);
db.region = require('../models/region.model')(sequelize, Sequelize);
db.city = require('../models/city.model')(sequelize, Sequelize);

// Location
db.region.belongsTo(db.country, {
  foreignKey: 'country_id',
});
db.country.hasMany(db.region, {
  foreignKey: 'country_id',
});
db.city.belongsTo(db.region, {
  foreignKey: 'region_id',
});
db.region.hasMany(db.city, {
  foreignKey: 'region_id',
});
db.city.belongsTo(db.country, {
  foreignKey: 'country_id',
});
db.country.hasMany(db.city, {
  foreignKey: 'country_id',
});

// User Roles
db.role.belongsToMany(db.user, {
  through: 'UserRoles',
  foreignKey: 'roleId',
  otherKey: 'userId',
});
db.user.belongsToMany(db.role, {
  through: 'UserRoles',
  foreignKey: 'userId',
  otherKey: 'roleId',
});
db.ROLES = ['user', 'admin', 'seller', 'student'];

// User Info
db.user.hasOne(db.userinfo, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
db.userinfo.belongsTo(db.user, {
  foreignKey: 'userId',
  unique: true,
});
db.city.hasMany(db.userinfo, {
  foreignKey: 'city_id',
});
db.userinfo.belongsTo(db.city, {
  foreignKey: 'city_id',
});
db.region.hasMany(db.userinfo, {
  foreignKey: 'region_id',
});
db.userinfo.belongsTo(db.region, {
  foreignKey: 'region_id',
});
db.country.hasMany(db.userinfo, {
  foreignKey: 'country_id',
});
db.userinfo.belongsTo(db.country, {
  foreignKey: 'country_id',
});

// Students, Sellers
db.user.hasOne(db.student, {
  foreignKey: 'userId',
});
db.student.belongsTo(db.user, {
  foreignKey: 'userId',
  unique: true,
});
db.user.hasOne(db.seller, {
  foreignKey: 'userId',
});
db.seller.belongsTo(db.user, {
  foreignKey: 'userId',
  unique: true,
});

// Seller Payout
db.seller.hasMany(db.payout, {
  as: 'Payouts',
  foreignKey: 'sellerId',
  allowNull: false,
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
db.payout.belongsTo(db.seller, {
  as: 'Seller',
  foreignKey: 'sellerId',
  allowNull: false,
});
db.payment.hasMany(db.payout, {
  as: 'Payouts',
  foreignKey: 'paymentId',
  allowNull: false,
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
db.payout.belongsTo(db.payment, {
  as: 'Payment',
  foreignKey: 'paymentId',
  allowNull: false,
});

// Messages, Conversations
// Message -- Conversation, creates message.conversationId NOT NULL
db.conversation.hasMany(db.message, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
db.message.belongsTo(db.conversation, { allowNull: false });
// Conversation -- User, creates conversation.creatorId NOT NULL
db.user.hasMany(db.conversation, {
  as: 'CreatedConversation',
  foreignKey: 'creatorId',
});
db.user.hasMany(db.conversation, {
  as: 'ReceivedConversation',
  foreignKey: 'recipientId',
});
db.room.hasMany(db.conversation, {
  as: 'Conversation',
  foreignKey: 'roomId',
});
db.conversation.belongsTo(db.user, {
  as: 'Creator',
  foreignKey: 'creatorId',
  allowNull: false,
});
db.conversation.belongsTo(db.user, {
  as: 'Recipient',
  foreignKey: 'recipientId',
  allowNull: false,
});
db.conversation.belongsTo(db.room, {
  as: 'Room',
  foreignKey: 'roomId',
  allowNull: true,
});
// Message -- User, creates message.senderId NOT NULL
db.user.hasMany(db.message, { as: 'SentMessage', foreignKey: 'senderId' });
db.message.belongsTo(db.user, {
  as: 'Sender',
  foreignKey: 'senderId',
  allowNull: false,
});
// Message -- User, creates message.receiverId NOT NULL
db.user.hasMany(db.message, {
  as: 'ReceivedMessage',
  foreignKey: 'receiverId',
});
db.message.belongsTo(db.user, {
  as: 'Receiver',
  foreignKey: 'receiverId',
  allowNull: false,
});

// Properties, Rooms
db.seller.hasMany(db.property, {
  as: 'Properties',
  foreignKey: 'ownerId',
  allowNull: false,
});
db.property.belongsTo(db.seller, {
  as: 'Owner',
  foreignKey: 'ownerId',
  allowNull: false,
});
db.seller.hasMany(db.property, {
  as: 'ThirdPartyProperties',
  foreignKey: 'resellerId',
  allowNull: true,
});
db.property.belongsTo(db.seller, {
  as: 'Reseller',
  foreignKey: 'resellerId',
  allowNull: true,
});
db.property.hasMany(db.room, {
  as: 'Rooms',
  foreignKey: 'propertyId',
  allowNull: false,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
db.room.belongsTo(db.property, {
  as: 'Property',
  foreignKey: 'propertyId',
  allowNull: false,
});
db.city.hasMany(db.property, {
  foreignKey: 'city_id',
});
db.property.belongsTo(db.city, {
  foreignKey: 'city_id',
});
db.region.hasMany(db.property, {
  foreignKey: 'region_id',
});
db.property.belongsTo(db.region, {
  foreignKey: 'region_id',
});
db.country.hasMany(db.property, {
  foreignKey: 'country_id',
});
db.property.belongsTo(db.country, {
  foreignKey: 'country_id',
});

// Room Pictures
db.room.hasMany(db.picture, {
  as: 'Pictures',
  foreignKey: 'roomId',
  allowNull: false,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
db.picture.belongsTo(db.room, {
  as: 'Room',
  foreignKey: 'roomId',
  allowNull: false,
});

// Delegations
db.property.hasOne(db.delegation, {
  as: 'Delegation',
  foreignKey: 'propertyId',
  allowNull: false,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
db.delegation.belongsTo(db.property, {
  as: 'Property',
  foreignKey: 'propertyId',
  allowNull: false,
});
db.seller.hasMany(db.delegation, {
  as: 'CreatedDelegations',
  foreignKey: 'ownerId',
  allowNull: false,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
db.delegation.belongsTo(db.seller, {
  as: 'Owner',
  foreignKey: 'ownerId',
  allowNull: false,
});
db.seller.hasMany(db.delegation, {
  as: 'AssignedDelegations',
  foreignKey: 'resellerId',
  allowNull: false,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
db.delegation.belongsTo(db.seller, {
  as: 'Reseller',
  foreignKey: 'resellerId',
  allowNull: false,
});

// Rentals, Payments
db.room.hasMany(db.rental, {
  as: 'Rentals',
  foreignKey: 'roomId',
  allowNull: false,
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
db.rental.belongsTo(db.room, {
  as: 'Room',
  foreignKey: 'roomId',
  allowNull: false,
});
db.rental.hasMany(db.payment, {
  as: 'Payments',
  foreignKey: 'rentalId',
  allowNull: false,
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
db.payment.belongsTo(db.rental, {
  as: 'Rental',
  foreignKey: 'rentalId',
  allowNull: false,
});
db.student.hasMany(db.rental, {
  as: 'Rentals',
  foreignKey: 'studentId',
  allowNull: false,
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
db.rental.belongsTo(db.student, {
  as: 'Student',
  foreignKey: 'studentId',
  allowNull: false,
});

// Booking Calendar
db.room.hasMany(db.bookeddate, {
  as: 'BookedDates',
  foreignKey: 'roomId',
  allowNull: false,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
db.bookeddate.belongsTo(db.room, {
  as: 'Room',
  foreignKey: 'roomId',
  allowNull: false,
});
db.rental.hasMany(db.bookeddate, {
  as: 'BookedDates',
  foreignKey: 'rentalId',
  allowNull: false,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
db.bookeddate.belongsTo(db.rental, {
  as: 'Rental',
  foreignKey: 'rentalId',
  allowNull: false,
});

module.exports = db;
