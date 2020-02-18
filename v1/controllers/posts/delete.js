const Post = require('../../models/post');

const errorResponse = require('../../helper-functions').errorResponse;

module.exports = deletePost = (req, res, next) => {
    const postId = req.params.post_id;
    const userId = req.userData.userId;

    Post.findById(postId).then(post => {

        // return an error if the user's ID does not match the post author's
        if(post.author_id !== userId) return errorResponse(res, 401, "Unauthorized");

        Post.findByIdAndRemove(postId).then((post) => {
            res.status(200).json({message: "Post deleted successfully"})
        }).catch(err => errorResponse(res, 500, err.message));
        
    }).catch(err => errorResponse(res, 500, err.message));
};