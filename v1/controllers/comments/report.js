const Comment = require('../../models/comment');
const User = require('../../models/user');

const errorResponse = require('../../helper-functions').errorResponse;

module.exports = (req, res, next) => {
    const userId = req.userData.userId;
    const commentId = req.params.comment_id;
    const block = req.query.block_user;

    Comment.findById(commentId).then(comment => {
        if (comment.author_id.toString() === userId.toString()) return errorResponse(res, 400, "Cannot report a comment made by its author");

        if (block === "true") {
            User.findById(userId).then((user) => {

                let blockedUsers = user.blockedUsers;

                if (blockedUsers.includes(comment.author_id.toString())) {
                    return errorResponse(res, 400, "User is already blocked");
                } else {
                    blockedUsers.push(comment.author_id);
                    user.save().then(() => {
                        return res.status(200).json({ message: "User blocked successfully" });
                    })
                }
            });
        } else {
            if (comment.hidden_from.includes(userId)) return errorResponse(res, 400, "Comment has already been reported & hidden from this user");


            comment.hidden_from.push(userId);

            comment.save().then(() => {
                res.status(200).json({ message: "Comment has been hidden successfully" });
            });
        }

    }).catch(err => (errorResponse(res, 500, err.message)));

}