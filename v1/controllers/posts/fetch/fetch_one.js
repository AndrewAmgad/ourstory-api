const Post = require('../../../models/post');

const errorResponse = require('../../../helper-functions').errorResponse;
// minimum amount of views for a post to be on trending
const trendingLimit = 20;

module.exports = (req, res, next) => {
    const postId = req.params.post_id;
    const userCity = req.userData.city.city_name;
    const userId = req.userData.userId;
    const time = new Date().getTime();

    Post.findByIdAndUpdate(postId, { $inc: { 'views': 1 }, last_view: time }).select('-__v').lean().then((post => {
        if (!post) errorResponse(res, 404, "Post ID not found");

        // add a boolean property to the response if the user's ID matches the author's.
        if(userId === post.author_id) {
            post.can_edit = true;
        } else {
            post.can_edit = false;
        };

        // Add post tags, allowing the "trending" tag to override the "near you" one if both apply. 
        if (userCity === post.city.name) post.tag = { id: 1, name: "Near you" };
        if (post.views > trendingLimit && post.last_view > new Date() - 7 * 60 * 60 * 24 * 1000) post.tag = { id: 0, name: "Trending" }

        // replace _id with id
        post.id = post._id;
        delete post._id

        // remove author_id if post is anonymous
        if (post.anonymous) delete post.author_id;
        delete post.anonymous

        res.status(200).json(post);
    })).catch(err => errorResponse(res, 500, err.message));

};
