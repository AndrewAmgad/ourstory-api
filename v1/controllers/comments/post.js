const Post = require('../../models/post');
const Comment = require('../../models/comment');
const mongoose = require('mongoose');

const errorResponse = require('../../helper-functions').errorResponse;
const sendNotification = require('../notifications/notifications').sendNotification;


// create a new comment for one post
module.exports = (req, res, next) => {
    const content = req.body.content;
    const anonymous = req.body.anonymous;
    const postId = req.params.post_id;
    const userData = req.userData;

    // Validate post ID and comment content
    if (!postId) return errorResponse(res, 400, "Post ID must be provided");
    if (!mongoose.Types.ObjectId.isValid(postId)) return errorResponse(res, 400, 'Invalid post ID')
    if (!content) return errorResponse(res, 400, "Comment content is required");

    // create the new comment object
    const comment = new Comment({
        author: anonymous === true ? "Anonymous" : userData.name,
        anonymous: anonymous === true ? true : false,
        author_id: userData.userId,
        city: { id: userData.city.city_id, name: userData.city.city_name },
        time: new Date().getTime(),
        content: content,
        post_id: postId
    })

    // save new comment
    comment.save()
        .then((comment) => {

            // Remove __v from response and replace _id with id
            const newComment = comment.toObject();
            if(newComment.anonymous === true) delete newComment.author_id;

            newComment.id = newComment._id;
            delete newComment._id;
            delete newComment.__v;
            delete newComment.anonymous;

            const notificationText = anonymous === true ? "Someone commented on your post" : `${userData.name} commented on your post`

            // send notification
            sendNotification(res, "Comment", notificationText, postId);

            res.status(200).json(newComment)
        })
        .catch((error) => errorResponse(res, 500, error.message));

};

