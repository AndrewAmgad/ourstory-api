const Comment = require('../../models/comment');

const errorResponse = require('../../helper-functions').errorResponse;

module.exports = (req, res, next) => {
    const userId = req.userData.userId;
    const commentId = req.params.comment_id;

    Comment.findById(commentId).then(comment => {
        if(comment.hidden_from.includes(userId)) return errorResponse(res, 400, "Comment has already been reported & hidden from this user");
        if(comment.author_id.toString() === userId.toString()) return errorResponse(res, 400, "Cannot hide a post from its author");
        
        comment.hidden_from.push(userId);

        comment.save().then(() => {
            res.status(200).json({message: "Comment has been hidden successfully"});
        });

    }).catch(err => (errorResponse(res, 500, err.message)));

}