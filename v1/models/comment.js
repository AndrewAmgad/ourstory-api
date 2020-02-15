const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    post_id: String,
    author: String,
    city: Object,
    content: String,
    time: String,
    anonymous: Boolean
});
    
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;