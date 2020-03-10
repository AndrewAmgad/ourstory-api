const Post = require('../../models/post');
const Comment = require('../../models/comment');
const mongoose = require('mongoose');

const errorResponse = require('../../helper-functions').errorResponse;
const sendNotification = require('../notifications/send-notification').sendNotification;


// create a new comment for one post
module.exports = async (req, res, next) => {
    const content = req.body.content;
    const anonymous = req.body.anonymous;
    const postId = req.params.post_id;
    const userData = req.userData;

    // Validate post ID and comment content
    if (!postId) return errorResponse(res, 400, "Post ID must be provided");
    if (!mongoose.Types.ObjectId.isValid(postId)) return errorResponse(res, 400, 'Invalid post ID')
    if (!content) return errorResponse(res, 400, "Comment content is required");

    // Check if the provided post ID exists
    const post = await Post.findById(postId);
    if (!post) return errorResponse(res, 404, "Post ID does no exist");

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
        .then((result) => {

            // store the userId in the user_activity array of the post's database object
            if (!post.users_activity.includes(userData.userId)) {
                Post.findByIdAndUpdate(postId, { $push: { users_activity: userData.userId } }).then()
            };

            // Remove __v from response and replace _id with id
            const newComment = result.toObject();
            if (newComment.anonymous === true) delete newComment.author_id;

            newComment.id = newComment._id;

            // delete unnecessary properties.
            ['_id', '__v', 'anonymous'].forEach(e => delete newComment[e]);

            // sender object which will be further sent to the notifiction functions.
            const sender = {
                id: userData.userId,
                name: userData.name,
                anonymous: anonymous
            };

            // make sure a notification is not sent if the author of the post is the one posting the comment
                sendNotification("comment", postId, sender);

            return res.status(200).json(newComment)
        })
        .catch((error) => errorResponse(res, 500, error.message));

};

