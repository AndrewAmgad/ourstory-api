const Post = require('../../../models/post');
const User = require('../../../models/user');
const Notification = require('../../../models/notification');
const createNotification = require('../notification').createNotification;
const createPushNotification = require('../notification').createPushNotification;

// send notifications to the post author
module.exports = async function sendToAuthor(type, postId, authorId, sender) {
    if(sender.id === authorId) return;
    // get device token to send notification
    const user = await User.findById(authorId);

    // check if user has enabled user_posts notification settings before continuing
    

    // get the amount of unread notifications
    const notificationsCount = await Notification.countDocuments({ user_id: authorId, is_read: false });

    // notifications content
    const content = sender.anonymous === true ? "Someone commented on your post" : `${sender.name} commented on your post`

    const deviceTokens = user.deviceTokens.map((token) => (token.deviceToken))
    createNotification(content, type, postId, authorId, sender);
    
    const notificationPayload = {
        post_Id: postId,
        content: content,
    };

    if (user.notificationSettings.userPosts) createPushNotification(notificationPayload, notificationsCount + 1, deviceTokens)


};