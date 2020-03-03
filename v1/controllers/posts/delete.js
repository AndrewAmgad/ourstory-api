const Post = require('../../models/post');
const Comment = require('../../models/comment');

const errorResponse = require('../../helper-functions').errorResponse;
var mongoose = require('mongoose');

module.exports = deletePost = (req, res, next) => {
    const postId = req.params.post_id;
    const userId = req.userData.userId;

    // validate provided post ID
    if(!mongoose.Types.ObjectId.isValid(postId)) return errorResponse(res, 400, "Invalid post ID")

    Post.findById(postId).then(post => {
        if(!post) return errorResponse(res, 404, "Invalid post ID");
        // return an error if the user's ID does not match the post author's
        if(post.author_id !== userId) return errorResponse(res, 401, "Unauthorized");

        // delete the post's comments
        Comment.deleteMany({post_id: postId}).then(() => console.log("comments deleted"))
        .catch(err => errorResponse(res, 500, err.message));

        Post.findByIdAndRemove(postId).then((post) => {
            res.status(200).json({message: "Post deleted successfully"})
        }).catch(err => errorResponse(res, 500, err.message));
        
    }).catch(err => errorResponse(res, 500, err.message));
};