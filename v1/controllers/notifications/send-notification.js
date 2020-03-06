const Notification = require('../../models/notification');
const Post = require('../../models/post');
const User = require('../../models/user')

const apn = require('apn');
const apnProvider = require('../../../app').apnProvider;


const errorResponse = require('../../helper-functions').errorResponse;

// creates a new notification and saves it to the database.
// this function is called from inside other routes
module.exports =  function sendNotification(res, type, content, post_id) {
    console.log("post id: " + post_id);

    Post.findById(post_id).then(async (post) => {
        const notification = new Notification({
            user_id: post.author_id,
            notification_type: type,
            content: content,
            time: new Date().getTime(),
            post_id: post_id,
            is_read: false
        });

        // get device token to send notification
        const user = await User.findById(post.author_id);

        for(var i = 0; i < user.deviceTokens.length; i++){
            const deviceToken = user.deviceTokens[i].deviceToken;
            const apnNotification = new apn.Notification({
                aps: {
                    "content-available" : true
                }
            }) ;

            // notification settings
            apnNotification.payload = {'post_id': post_id};
            apnNotification.alert = content;
            apnNotification.topic = process.env.bundleId;
            apnNotification.sound = "ping.aiff";
            apnNotification.pushType = "alert";
            apnNotification.badge = 1

            // send the notification
            apnProvider.send(apnNotification, deviceToken).then((result) => {
                console.log(result);
            });
            
        };

        notification.save()
            .then((result) => {
                console.log("Notification Sent");
                console.log("ID: " + result._id);
            });

    }).catch(err => console.log(err))


}

