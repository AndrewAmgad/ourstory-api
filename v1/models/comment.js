const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    post_id: String,
    author: String,
    author_id: String,
    city: Object,
    content: String,
    time: Number,
    anonymous: Boolean
});
    
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;