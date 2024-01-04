const { authJwt } = require('../middleware');
const controller = require('../controllers/messaging.controller');

module.exports = function setroutes(app) {
  app.get(
    '/api/messaging/conversationlist',
    [authJwt.verifyToken],
    controller.userConversationList
    /* #swagger.tags = ['Messaging']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/messaging/messagelist',
    [authJwt.verifyToken],
    controller.userMessageList
    /* #swagger.tags = ['Messaging']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/messaging/conversation',
    [authJwt.verifyToken],
    controller.userConversation
    /* #swagger.tags = ['Messaging']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.post(
    '/api/messaging/new',
    [authJwt.verifyToken],
    controller.newMessage
    /* #swagger.tags = ['Messaging']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.post(
    '/api/messaging/reply',
    [authJwt.verifyToken],
    controller.newReply
    /* #swagger.tags = ['Messaging']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
  app.get(
    '/api/messaging/roomconversations',
    [authJwt.verifyToken, authJwt.isSeller],
    controller.roomConversationList
    /* #swagger.tags = ['Messaging']
       #swagger.security = [{
               "apiKeyAuth": []
        }] */
  );
};
