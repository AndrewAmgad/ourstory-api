const User = require('../../models/user');
const errorResponse = require('../../helper-functions').errorResponse

// sendpoint for enabling / disabling notifications for the user
module.exports.updateSettings = async (req, res, next) => {
    const userId = req.userData.userId;

    // userActivity will be used to enable notifications of posts the user commented at
    // userPosts is notifications of the user's posts
    const userActivity = req.body.user_activity;
    const userPosts = req.body.user_posts

    if (!userActivity && !userPosts) return errorResponse(res, 400, "One of the following fields are required 'user_activity', 'user_posts'");

    const user = await User.findById(userId).catch(err => (errorResponse(res, 500, err.message)));

    // get the user's previous settings and apply only the changes.
    var notificationSettings = user.notificationSettings ? user.notificationSettings : {};
    if (userActivity !== undefined) notificationSettings.userActivity = userActivity;
    if (userPosts !== undefined) notificationSettings.userPosts = userPosts;

    // update the user notification settings using the updated settings object.
    User.findByIdAndUpdate(userId, { notificationSettings: notificationSettings }, { new: true }).then((user) => {

        const { notificationSettings } = user;
        return res.status(200).json({ user_activity: notificationSettings.userActivity, user_posts: notificationSettings.userPosts });

    }).catch(err => (errorResponse(res, 500, err.message)));
};

module.exports.getSettings = (req, res, next) => {
    const userId = req.userData.userId;

    User.findById(userId).then(user => {

        const { notificationSettings } = user;
        return res.status(200).json({ user_activity: notificationSettings.userActivity, user_posts: notificationSettings.userPosts })
})
}