const User = require('../../models/user');

const errorResponse = require('../../helper-functions').errorResponse;
const createToken = require('../../helper-functions').createToken;

const jwtCache = require('../../../app').jwtCache;

module.exports = signOut = (req, res, next) => {
    const userId = req.userData.userId;
    const token = req.token;

    // remove the user's cached token
    const cache = jwtCache.get(userId);
    if(cache !== undefined) {
        if(cache === token){
            jwtCache.del(userId);
            console.log("Token removed from cache");
        };
    };

    // find the user object, delete the logged out token
    User.findByIdAndUpdate(userId, {$pull: {activeTokens: token}})
    .then(result => {
        console.log("Token removed from database");
        res.status(200).json({message: "User logged out successfully"});
    }).catch(err => errorResponse(res, 200, err.message));

};