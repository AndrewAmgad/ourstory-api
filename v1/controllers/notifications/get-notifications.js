const Notification = require('../../models/notification');

// get all notifications for one user
module.exports = (req, res, next) => {
    const userId = req.userData.userId;

    Notification.find({ user_id: userId }).select("-__v").lean().sort({ _id: -1 }).then(async (notifications) => {
        if (notifications.length < 1) return res.status(200).json([]);
        
        notifications.map((notification) => {
            // replace _id with id
            notification.id = notification._id;
            delete notification._id
            delete notification.user_id
        });

        // modifiy unread notifications and mark them as read
        await Notification.updateMany({user_id: userId, is_read: false}, {is_read: true});

        res.status(200).json(notifications)
    }).catch(err => errorResponse(res, 500, err.message));
};
