const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    author: String,
    city: Object,
    content: String,
    time: String,
    views: Number
});
    
const Post = mongoose.model('Post', postSchema);

module.exports = Post;