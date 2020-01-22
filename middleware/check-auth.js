const jwt = require('jsonwebtoken');
const errorResponse = require('../helper-functions').errorResponse;

module.exports = (req, res, next) => {
    if(!req.headers.authorization) return errorResponse(res, 401, "A token has to be provided");

    const token = req.headers.authorization.split(" ")[1];
    try {
        // decode provided jwt
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);

        // save decoded user data to the req object
        req.userData = decodedToken;
        req.token = token;
        next();

    } catch(error){
        return errorResponse(res, 401, "Unauthorized");
    }

}