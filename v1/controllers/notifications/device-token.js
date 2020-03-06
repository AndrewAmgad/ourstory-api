const User = require('../../models/user');
const errorResponse = require('../../helper-functions').errorResponse

// send the device token to the server to be saved for sending notifications later on
module.exports = async (req, res, next) => {
    const deviceToken = req.body.device_token;
    const userId = req.userData.userId;
    const authToken = req.token;

    // store both the device token along with its corresponding authentication token
    const tokensObject = {
        authToken: authToken,
        deviceToken: deviceToken
    };

    const user = await User.findById(userId).catch(err => (errorResponse(res, 500, err.message)))

    for(var i = 0; i < user.deviceTokens.length; i++){
        if(user.deviceTokens[i].deviceToken === deviceToken) return errorResponse(res, 400, "Token has been already saved")
    };

    // save the token to an array in the user's database object.
    User.findByIdAndUpdate(userId, { $push: { deviceTokens: tokensObject} }).then(() => {
        res.status(200).json({ message: "Device token saved" });
    }).catch(err => (errorResponse(res, 500, err.message)))
};