const User = require('../../models/user');
const errorResponse = require('../../helper-functions').errorResponse;

module.exports = async (req, res) => {
    const userId = req.userData.userId;
    const blockedUserId = req.params.user_id;

    const blockedUser = await User.findById(blockedUserId).catch(err => errorResponse(res, 500, err.response));

    if (!blockedUser) return errorResponse(res, 404, "Entered ID does not exist");

    User.findById(userId).then((user) => {

        let blockedUsers = user.blockedUsers;

        if (blockedUsers.includes(blockedUserId.toString())) {
            return errorResponse(res, 400, "User is already blocked");
        } else {
            blockedUsers.push(blockedUser);
            user.save().then(() => {
                res.status(200).json({message: "User blocked successfully"});
            })
        }
    });
};