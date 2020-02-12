const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String},
    email: {type: String},
    city: {type: Object},
    password: {type: String},
    activeTokens: Array,
    verified: Boolean,
    verfCode: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;