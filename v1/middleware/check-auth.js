const jwt = require('jsonwebtoken');
const errorResponse = require('../helper-functions').errorResponse;

const User = require('../models/user');
const jwtCache = require('../../app').jwtCache;


// check if the provided token exists in the database, cache it for one day if it does.
function getTokenFromDB(userId, token, res, next){
    var activeToken = false;
                User.findById(userId).then((user) => {
                    for (var i = 0; i < user.activeTokens.length; i++) {
    
                        if (user.activeTokens[i] === token) {
                            activeToken = true;

                            const cache = jwtCache.set(userId, token, 10000);
                            
                            if(!cache) errorResponse(res, 500, "Server auth error");
                            console.log("Token saved to cache")
                        };
                    };
    
                    if (!activeToken) return errorResponse(res, 401, "Unauthorized, inactive token");
                    
                    next();
                }).catch(error => console.log(error))
};

module.exports = (req, res, next) => {
    // return an error if no token is found in the header
    if (!req.headers.authorization) return errorResponse(res, 401, "A token has to be provided");

    // grab token from the authorization header
    const token = req.headers.authorization.split(" ")[1];

    try {

        // decode provided jwt and save the data to the req object
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decodedToken;
        req.token = token;

        const userId = decodedToken.userId;

        // check if the token is already cached
        const key = jwtCache.get(userId);

        if (key !== undefined) {
            if(key === token) {
                console.log("token found in cache");
                tokenInCache = true;
                next();
            } else {
                getTokenFromDB(userId, token, res, next);
            };

        } else{
            getTokenFromDB(userId, token, res, next);
        };


    } catch (error) {
        console.log(error)
        return errorResponse(res, 401, "Unauthorized");
    };
};