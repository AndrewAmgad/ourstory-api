const User = require('../../models/user');
const Post = require('../../models/post');
const Comment = require('../../models/comment');

const errorResponse = require('../../helper-functions').errorResponse;

module.exports = profile = async (req, res, next) => {
    // get the profile of an ID if it is provided, otherwise, get the requesting user's profile.
    const userId = req.query.user_id ? req.query.user_id : req.userData.userId;

    // get the user object
    const user = await User.findById(userId).catch(err => {return errorResponse(res, 500, err.message)});
    if(!user) return errorResponse(res, 404, "User not found");

    // get the count of posts & comments created by the user
    const postsCount = await Post.countDocuments({author_id: userId});
    const commentsCount = await Comment.countDocuments({author_id: userId});

        const profile = {
            id: user._id,
            name: user.name,
            email: user.email,
            city: {id: user.city.city_id, name: user.city.city_name},
            posts_count: postsCount,
            comments_count: commentsCount
        };

        res.status(200).json(profile);
};