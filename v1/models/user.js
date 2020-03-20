const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mainDb = require('../../app').mainDb;

const userSchema = new Schema({
    name: {type: String},
    email: {type: String},
    city: {type: Object},
    password: {type: String},
    activeTokens: Array,
    verified: Boolean,
    verfCode: String,
    passChange: Object,
    deviceTokens: [],
    notificationSettings: Object,
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;