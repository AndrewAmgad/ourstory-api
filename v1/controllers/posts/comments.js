const Post = require('../../models/post');
const Comment = require('../../models/comment');
const mongoose = require('mongoose');

const errorResponse = require('../../helper-functions').errorResponse;
const sendNotification = require('../notifications/notifications').sendNotification;

// get all comments for one post
module.exports.getComments = (req, res, next) => {
    const postId = req.params.post_id;

    // verify if an integer is provided for pagination
    const page = Number.isNaN(parseInt(req.query.page, 10)) ? 0 : parseInt(req.query.page, 10);
    const pageLimit = Number.isNaN(parseInt(req.query.page_limit, 10)) ? 10 : parseInt(req.query.page_limit, 10);

    // check if page and page limit are numbers
    if (typeof page !== 'number' || typeof pageLimit !== 'number') return errorResponse(res, 400, "page and page_limit must be numbers");


    // validate received post ID
    if (!postId) return errorResponse(res, 400, "Post ID must be provided");
    if (!mongoose.Types.ObjectId.isValid(postId)) return errorResponse(res, 400, 'Invalid post ID')

    // find all comments for provided post ID
    Comment.find({ post_id: postId })
        .skip(page && pageLimit ? (page - 1) * pageLimit : 0)
        .limit(page !== 0 ? pageLimit : null)
        .select("-__v").lean().sort({ _id: -1 }).then(comments => {

            // return an empty array if no comments are found
            if (!comments || comments.length < 1) return res.status(200).json([]);

        // replace _id with id
            comments.map((comment) => {
                comment.id = comment._id;
                delete comment._id
            });

            res.status(200).json(comments)
        });
};

// create a new comment for one post
module.exports.postComment = (req, res, next) => {
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
            newComment.id = newComment._id;
            delete newComment._id;
            delete newComment.__v;

            const notificationText = anonymous === true ? "Someone commented on your post" : `${userData.name} commented on your post`

            // send notification
            sendNotification(res, "Comment", notificationText, postId);

            res.status(200).json(newComment)
        })
        .catch((error) => errorResponse(res, 500, error.message));

};

