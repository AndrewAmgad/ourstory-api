const jwt = require('jsonwebtoken');
const Notification = require('./models/notification');
const Post = require('./models/post');

// json response when there is an error of any kind
module.exports.errorResponse = function errorResponse(res, code, message) {
    return res.status(code).json({
        error: true,
        reason: message
    });
}

// generate jwt
module.exports.createToken = function createToken(email, id, name, city) {
    return jwt.sign({
        email: email,
        userId: id,
        name: name,
        city: city
    },
        process.env.JWT_KEY,
        {
            expiresIn: "999d"
        });
}


