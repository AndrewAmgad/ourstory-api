const User = require('../../models/user');

const errorResponse = require('../../helper-functions').errorResponse;

module.exports = profile = (req, res, next) => {
    const userData = req.userData;
    const token = req.token;
    if(!userData) return errorReponse(res, 404, "User not found");
    User.findById(userData.userId).then(user => {
        if(!user) return errorReponse(res, 404, "User not found");

        const profile = {
            id: user._id,
            name: user.name,
            email: user.email,
            city: user.city,
            token: token
        };

        res.status(200).json(profile);
    }).catch(error => errorResponse(res, 500, error.message));
};