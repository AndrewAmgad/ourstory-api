const Notification = require('../../models/notification');
const Post = require('../../models/post');

const errorResponse = require('../../helper-functions').errorResponse;


module.exports.sendNotification = function sendNotification(res, type, content, post_id) {
    console.log("post id: " + post_id);

    Post.findById(post_id).then((post) => {
        const notification = new Notification({
            user_id: post.author_id,
            notification_type: type,
            content: content,
            time: new Date().getTime(),
            post_id: post_id
        })

        notification.save()
            .then((result) => {
                console.log("Notification Sent");
                console.log("ID: " + result._id);
            })
            .catch(err => errorResponse(res, 500, err.message));

    }).catch(err => errorResponse(res, 500, err.message));


}

// get all notifications for one user
module.exports.getNotifications = (req, res, next) => {
    const userId = req.userData.userId;

    Notification.find({ user_id: userId }).select("-__v").lean().then((notifications) => {
        if(notifications.length < 1) return errorResponse(res, 404, "No notifications found");
        
        notifications.map((notification) => {
            notification.id = notification._id;
            delete notification._id
            delete notification.user_id
        });

        res.status(200).json(notifications)
    });
};

