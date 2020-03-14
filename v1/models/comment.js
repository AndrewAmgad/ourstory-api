const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    post_id: { type: Schema.Types.ObjectId, ref: 'Post' },
    author: String,
    author_id: { type: Schema.Types.ObjectId, ref: 'User' },
    city: Object,
    content: String,
    time: Number,
    anonymous: Boolean
});
    
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;