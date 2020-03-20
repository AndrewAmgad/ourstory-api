const Post = require('../../models/post');
const User = require('../../models/user');
const errorResponse = require('../../helper-functions').errorResponse;

// report post and hide it from the user if they choose to do so
module.exports = async (req, res, next) => {
    const userId = req.userData.userId;
    const postId = req.params.post_id;
    const block = req.query.block_user;

    Post.findById(postId).then(post => {

        if (post.author_id.toString() === userId.toString()) return errorResponse(res, 400, "Cannot report a post made by its author");


        if (block === "true") {
            User.findById(userId).then((user) => {

                let blockedUsers = user.blockedUsers;

                if (blockedUsers.includes(post.author_id.toString())) {
                    return errorResponse(res, 400, "User is already blocked");
                } else {
                    blockedUsers.push(post.author_id);
                    user.save().then(() => {
                        return res.status(200).json({ message: "User blocked successfully" });
                    })
                }
            });

        } else {
            // check if the post is already hidden from this user
            if (post.hidden_from) {
                if (post.hidden_from.includes(userId)) return errorResponse(res, 400, "Post has already been reported & hidden from this user");
                // add the user ID to the hidden_from array
                post.hidden_from.push(userId);
            } else {
                post.hidden_from = userId;
            }

            post.save().then(() => {
                res.status(200).json({ message: "Post has been reported successfully" });
            })
        }

    }).catch(err => (errorResponse(res, 500, err.message)));



};