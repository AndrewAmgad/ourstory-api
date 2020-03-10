const Notification = require('../../models/notification');
const apnProvider = require('../../../app').apnProvider;
const User = require('../../models/user');
const errorResponse = require('../../helper-functions').errorResponse;
const apn = require('apn');

// get all notifications for one user
module.exports = (req, res, next) => {
    const userId = req.userData.userId;

    Notification.find({ user_id: userId }).select("-__v").lean().sort({ _id: -1 }).then(async (notifications) => {
        if (notifications.length < 1) return res.status(200).json([]);

        // get device token to send notification
        const user = await User.findById(userId);

        // send an empty notification to reset the notification badges
        for (var i = 0; i < user.deviceTokens.length; i++) {
            const deviceToken = user.deviceTokens[i].deviceToken;
            const apnNotification = new apn.Notification({
                aps: {
                    "content-available": true
                }
            });

            apnNotification.badge = 0;
            apnNotification.topic = process.env.bundleId;

            // send the notification
            apnProvider.send(apnNotification, deviceToken).then((result) => {
                console.log(result);
            });
        }


        notifications.map((notification) => {
            // replace _id with id
            notification.id = notification._id;
            delete notification._id
            delete notification.user_id
        });

        // modifiy unread notifications and mark them as read
        await Notification.updateMany({ user_id: userId, is_read: false }, { is_read: true });

        res.status(200).json(notifications)
    }).catch(err => errorResponse(res, 500, err.message));
};
