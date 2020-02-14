const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    user_id: String,
    notification_type: String,
    content: String,
    time: Number,
    post_id: String

});
    
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;