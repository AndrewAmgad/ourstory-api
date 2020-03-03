const Post = require('../../models/post');
const Comment = require('../../models/comment');

const errorResponse = require('../../helper-functions').errorResponse;
const mongoose = require('mongoose');

module.exports = (req, res, next) => {
    const userId = req.userData.userId;
    const commentId = req.params.comment_id;

    // validate provided comment ID
    if (!mongoose.Types.ObjectId.isValid(commentId)) return errorResponse(res, 400, "Invalid comment ID")

    Comment.findById(commentId).then(comment => {
        if (!comment) return errorResponse(res, 404, "Comment not found");

        // return an error if the user's ID does not match the comment's author
        if (comment.author_id !== userId) return errorResponse(res, 401, "Unauthorized");

        Comment.findByIdAndRemove(commentId).then((comment) => {
            res.status(200).json({ message: "Comment deleted successfully" });
        }).catch(err => errorResponse(res, 500, err.message));

    }).catch(err => errorResponse(res, 500, err.message));
};