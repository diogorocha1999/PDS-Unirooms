const db = require('../models');

const User = db.user;
const Conversation = db.conversation;
const Message = db.message;
const Room = db.room;
const Property = db.property;
const { Op } = db.Sequelize;

exports.roomConversationList = async (req, res) => {
  try {
    if (!req.query.roomId || !req.query.roomId === '' || req.query.roomId < 1) {
      return res.status(400).json({ message: 'Provide a valid roomId' });
    }

    const room = await Room.findOne({
      where: {
        roomId: req.query.roomId,
      },
      include: {
        model: Property,
        required: true,
        as: 'Property',
        where: {
          [Op.or]: [{ ownerId: req.sellerId }, { resellerId: req.sellerId }],
        },
      },
    });

    if (Object.keys(room).length === 0) {
      return res
        .status(403)
        .send({ message: "You don't have access to this room" });
    }

    const conversations = await Conversation.findAll({
      where: {
        roomId: room.roomId,
      },
    });

    if (Object.keys(conversations).length === 0) {
      return res.status(404).json({ message: 'No conversations found' });
    }

    return res.status(200).json(conversations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Error retrieving room conversations',
    });
  }
};

exports.userConversationList = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: ['CreatedConversation', 'ReceivedConversation'],
    });

    if (
      !user ||
      (Object.keys(user.CreatedConversation).length === 0 &&
        Object.keys(user.CreatedConversation).length === 0)
    ) {
      return res.status(404).json({ message: 'No conversations found' });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error retrieving user conversations' });
  }
};

exports.userConversation = async (req, res) => {
  try {
    if (!req.query.conversationId) {
      return res.status(400).json({ message: 'Provide a conversationId' });
    }
    const conversation = await Conversation.findByPk(req.query.conversationId, {
      where: {
        [Op.or]: [{ creatorId: req.userId }, { recipientId: req.userId }],
      },
      include: [
        {
          model: Message,
          required: false,
        },
      ],
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    return res.status(200).json(conversation);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error retrieving user conversations' });
  }
};

exports.userMessageList = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: [],
      include: ['SentMessage', 'ReceivedMessage'],
    });

    if (
      !user ||
      (Object.keys(user.SentMessage).length === 0 &&
        Object.keys(user.ReceivedMessage).length === 0)
    ) {
      return res.status(400).json({ message: 'No messages found' });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error retrieving user messages' });
  }
};

exports.newMessage = async (req, res) => {
  try {
    if (!req.body.subject || !req.body.content || !req.body.recipientId) {
      return res
        .status(400)
        .json({ message: 'Provide a subject, content and recipientId' });
    }

    if (req.userId === req.body.recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send a message to yourself" });
    }

    if (req.body.recipientId === 1) {
      return res
        .status(400)
        .json({ message: "You can't send a message to the system" });
    }

    const conversation = await Conversation.create({
      subject: req.body.subject,
      creatorId: req.userId,
      recipientId: req.body.recipientId,
      roomId: req.body.roomId,
    });

    await conversation.createMessage({
      content: req.body.content,
      senderId: req.userId,
      receiverId: req.body.recipientId,
    });

    return res.status(201).json(conversation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating message' });
  }
};

exports.newReply = async (req, res) => {
  try {
    if (!req.body.conversationId) {
      return res.status(400).json({ message: 'Provide a conversationId' });
    }

    if (!req.body.content || !req.body.receiverId) {
      return res
        .status(400)
        .json({ message: 'Provide a subject, content and receiverId' });
    }

    if (req.body.receiverId === 1) {
      return res
        .status(400)
        .json({ message: "You can't reply to a system message" });
    }

    const conversation = await Conversation.findByPk(req.body.conversationId, {
      where: {
        [Op.or]: [{ creatorId: req.userId }, { recipientId: req.userId }],
      },
    });

    if (!conversation) {
      return res.status(400).json({ message: 'Conversation not found' });
    }

    const message = await conversation.createMessage({
      content: req.body.content,
      senderId: req.userId,
      receiverId: req.body.receiverId,
    });

    return res.status(201).json(message);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating reply' });
  }
};
