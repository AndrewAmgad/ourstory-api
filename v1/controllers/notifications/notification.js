const Notification = require('../../models/notification');
const apn = require('apn');
const apnProvider = require('../../../app').apnProvider;


// create a new notification object and saves it to the database
module.exports.createNotification = createNotification = (content, type, postId, receiver, sender) => {

    // save notification to the database
    const notification = new Notification({
        user_id: receiver,
        notification_type: type,
        content: content,
        sender: sender,
        time: new Date().getTime(),
        post_id: postId,
        is_read: false
    });

    notification.save()
        .then(() => {
            console.log("Notification Sent");
        });

};

// create a new push notification
module.exports.createPushNotification = createPushNotification = (payload, badge, deviceTokens) => {

    const apnNotification = new apn.Notification({
        aps: {
            "content-available": true
        }
    });

    // notification options
    apnNotification.payload = payload;
    apnNotification.alert = payload.content;
    apnNotification.topic = process.env.bundleId;
    apnNotification.sound = "ping.aiff";
    apnNotification.pushType = "alert";
    apnNotification.badge = badge;

    // send the notification
    apnProvider.send(apnNotification, deviceTokens).then((result) => {
        console.log(result);
        if(result.failed[0]){
            console.log(result.failed[0].response)
        }
    });

}
