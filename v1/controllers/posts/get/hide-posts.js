const User = require('../../../models/user');
const errorResponse = require('../../../helper-functions').errorResponse;

// hide posts if the user has hidden them before or blocked their author

module.exports = async (userId, posts) => {
    const user = await User.findById(userId).catch(err => errorResponse(res, 500, err.message));
    const blockedUsers = user.blockedUsers;

    // remove the posts the user had reported / hidden previously as well as posts from blocked users
    var filter = posts.filter(post => (!post.hidden_from.includes(userId) && !blockedUsers.includes(post.author_id.toString())));

    return filter;
};