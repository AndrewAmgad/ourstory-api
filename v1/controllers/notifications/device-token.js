const User = require('../../models/user');

// send the device token to the server to be saved for sending notifications later on
module.exports = (req, res, next) => {
    const deviceToken = req.body.device_token;
    const userId = req.userData.userId;
    const authToken = req.token;

    // store both the device token along with its corresponding authentication token
    const tokensObject = {
        authToken: authToken,
        deviceToken: deviceToken
    };

    // save the token to an array in the user's database object.
    User.findByIdAndUpdate(userId, { $push: { deviceTokens: tokensObject} }).then(() => {
        res.status(200).json({ message: "Device token saved" });
    });
};