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
        if (comment.author_id.toString() !== userId.toString()) return errorResponse(res, 401, "Unauthorized");

        Comment.findByIdAndRemove(commentId).then(async () => {

            // get the remaining amount of comments that the user has on this post
            const remainingComments = await Comment.countDocuments({ post_id: comment.post_id, author_id: userId });

            // delete the user ID from the post's users_activty object so that they would no longer receive notifications if remainingComments is equal to 0
            if (remainingComments === 0) {
                Post.findByIdAndUpdate(comment.post_id, { $pull: { users_activity: userId } })
                    .then(() => console.log("Deleted from users activity"));
            };


            res.status(200).json({ message: "Comment deleted successfully" });
        });

    }).catch(err => errorResponse(res, 500, err.message));
};