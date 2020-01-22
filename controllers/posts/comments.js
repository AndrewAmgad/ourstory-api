const Post = require('../../models/post');
const Comment = require('../../models/comment');
const mongoose = require('mongoose');

const errorResponse = require('../../helper-functions').errorResponse;

module.exports.getComments = (req, res, next) => {
    const postId = req.params.post_id;

    // validate received post ID
    if (!postId) return errorResponse(res, 400, "Post ID must be provided");
    if (!mongoose.Types.ObjectId.isValid(postId)) return errorResponse(res, 400, 'Invalid post ID')

    // find all comments for provided post ID
    Comment.find({ post_id: postId }).select("-__v").lean().sort({_id: -1}).then(comments => {
        console.log(comments)
        if (!comments || comments.length < 1) return errorResponse(res, 400, `No comments found for ${postId}`);

        res.status(200).json(comments)
    });
};

module.exports.postComment = (req, res, next) => {
    const content = req.body.content;
    const postId = req.params.post_id;
    const userData = req.userData;

    // Validate post ID and comment content
    if (!postId) return errorResponse(res, 400, "Post ID must be provided");
    if (!mongoose.Types.ObjectId.isValid(postId)) return errorResponse(res, 400, 'Invalid post ID')
    if (!content) return errorResponse(res, 400, "Comment content is required");

    // create the new comment object
    const comment = new Comment({
        author: userData.name,
        city: { id: userData.city.city_id, name: userData.city.city_name },
        time: new Date().getTime(),
        content: content,
        post_id: postId
    })

    // save new comment
    comment.save()
        .then((comment) => {

            // Remove __v from response
            const newComment = comment.toObject();
            delete newComment.__v

            res.status(200).json(newComment)
        })
        .catch((error) => errorResponse(res, 500, error.message));

};

