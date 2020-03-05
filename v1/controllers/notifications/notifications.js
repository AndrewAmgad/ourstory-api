const Notification = require('../../models/notification');
const Post = require('../../models/post');
const User = require('../../models/user');

const errorResponse = require('../../helper-functions').errorResponse;


// creates a new notification and saves it to the database.
// this function is called from inside other routes
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

    Notification.find({ user_id: userId }).select("-__v").lean().sort({ _id: -1 }).then((notifications) => {
        if (notifications.length < 1) return res.status(200).json([]);

        // replace _id with id
        notifications.map((notification) => {
            notification.id = notification._id;
            delete notification._id
            delete notification.user_id
        });

        res.status(200).json(notifications)
    }).catch(err => errorResponse(res, 500, err.message));
};

// send the device token to the server to be saved for sending notifications later on
module.exports.sendDeviceToken = (req, res, next) => {
    const deviceToken = req.body.device_token;
    const userId = req.userData.userId;
    const authToken = req.token;

    // store both the device token along with its corresponding authentication token
    const tokensObject = {
        authToken: authToken,
        deviceToken: deviceToken
    }


    // save the token to an array in the user's database object.
    User.findByIdAndUpdate(userId, { $push: { deviceTokens: tokensObject} }).then(() => {
        res.status(200).json({ message: "Device token saved" });
    });
};