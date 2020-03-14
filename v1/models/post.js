const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    author: String,
    author_id: String,
    city: Object,
    content: String,
    time: Number,
    views: Number,
    last_view: Number,
    anonymous: Boolean,
    users_activity: []
});
    
const Post = mongoose.model('Post', postSchema);

module.exports = Post;