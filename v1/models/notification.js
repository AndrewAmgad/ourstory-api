const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    notification_type: String,
    content: String,
    sender: Object,
    time: Number,
    post_id: { type: Schema.Types.ObjectId, ref: 'Post' },
    is_read: Boolean,

});
    
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;