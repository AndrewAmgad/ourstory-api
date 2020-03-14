const Post = require('../../../models/post');
const User = require('../../../models/user');
const Notification = require('../../../models/notification');
const createNotification = require('../notification').createNotification
const createPushNotification = require('../notification').createPushNotification

module.exports = async function sendToCommenters(type, postId, authorId, sender, usersActivity) {
    User.find({ '_id': { $in: usersActivity } }).then(users => {
        users.map(async (user) => {
            if (user.deviceTokens.length !== 0 && sender.id.toString() !== user.id.toString() && user.id.toString() !== authorId.toString()) {

                // get the user's device tokens
                var deviceTokens = [];
                user.deviceTokens.map(item => deviceTokens.push(item.deviceToken));

                // get the amount of unread notifications
                const notificationsCount = await Notification.countDocuments({ user_id: user._id, is_read: false });

                // notifications content
                const content = sender.anonymous === true ? "Someone also replied to a post you commented on" : `${sender.name} also replied to a post you commented on`
                createNotification(content, type, postId, user.id, sender);
    
                const notificationPayload = {
                    post_Id: postId,
                    content: content,
                };

                console.log("SENT TO: "  + user.name);
        
                if (user.notificationSettings.userPosts) createPushNotification(notificationPayload, notificationsCount + 1, deviceTokens)
            
            
            }

        })
    }).catch(err => console.log(err));
};