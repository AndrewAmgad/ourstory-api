const Post = require('../../models/post');
const sendToAuthor = require('./posts/send-to-author');
const sendToCommenters = require('./posts/send-to-commenters');


// creates a new notification and saves it to the database.
// this function is called by other routes
module.exports.sendNotification = function sendNotification(type, postId, sender) {
    if (type === "comment") {
        Post.findById(postId).then(async (post) => {
            sendToAuthor(type, postId, post.author_id, sender);
            sendToCommenters(type, postId, post.author_id, sender, post.users_activity);
        });
    };

}

