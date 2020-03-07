const User = require('../../models/user');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const errorResponse = require('../../helper-functions').errorResponse;
const createToken = require('../../helper-functions').createToken;

module.exports = signIn = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) return errorResponse(res, 400, "Email and password are required");

    User.findOne({ email: email }).then(user => {
        if (!user) return errorResponse(res, 404, "Email does not exist");
        if (!bcrypt.compareSync(password, user.password)) return errorResponse(res, 401, "Password is incorrect");

        // generate jwt
        const token = createToken(user.email, user._id, user.name, user.city);

        // remove the oldest token if the user has more than 10 active tokens
        var activeTokens = user.activeTokens;
        if (activeTokens.length > 10) {
            activeTokens.shift();
            activeTokens.push(token);
        } else {
            activeTokens.push(token);
        }

        // push the jwt to the user's activeTokens array
        User.findByIdAndUpdate(user._id, { activeTokens: activeTokens }).then(() => {
            // return user along with the token
            res.status(200).json({
                id: user._id,
                name: user.name,
                email: user.email,
                city: { id: user.city.city_id, name: user.city.city_name },
                token: token
            });

        });

    }).catch(err => errorResponse(res, 500, err))
};