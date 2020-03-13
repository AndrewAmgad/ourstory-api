const User = require('../../models/user');

const errorResponse = require('../../helper-functions').errorResponse;
const createToken = require('../../helper-functions').createToken;

const jwtCache = require('../../../app').jwtCache;

module.exports.signOut = signOut = async (req, res, next) => {
    const userId = req.userData.userId;
    const token = req.token;

    // remove the user's cached token
    const cache = jwtCache.get(userId);
    if (cache !== undefined) {
        if (cache === token) {
            jwtCache.del(userId);
            console.log("Token removed from cache");
        };
    };

    // get the device token that's corresponding to the provided auth token
    const user = await User.findById(userId);
    var deviceToken = {};

    if (user.deviceTokens) {
        for (var i = 0; i < user.deviceTokens.length; i++) {
            if (user.deviceTokens[i].authToken === token) deviceToken = user.deviceTokens[i];
        };
    }


    // find the user object, delete the logged out token
    User.findByIdAndUpdate(userId, { $pull: { activeTokens: token, deviceTokens: deviceToken } })
        .then(result => {
            console.log("Token removed from database");
            res.status(200).json({ message: "User logged out successfully" });
        }).catch(err => errorResponse(res, 200, err.message));

};

// sign out all devices & invalidate all active tokens
module.exports.signOutAll = signOutAll = (req, res, next) => {
    const userId = req.userData.userId;
    const token = req.token;

    User.findByIdAndUpdate(userId, { activeTokens: [], deviceTokens: [] }).catch(err => errorResponse(res, 500, err.message));

    // remove the user's cached token
    const cache = jwtCache.get(userId);
    if (cache !== undefined) {
        if (cache === token) {
            jwtCache.del(userId);
            console.log("Token removed from cache");
        };
    };

    res.status(200).json({ message: "Logged out all sessions" })
};