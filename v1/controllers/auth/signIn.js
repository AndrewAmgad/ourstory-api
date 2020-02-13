const User = require('../../models/user');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const errorResponse = require('../../helper-functions').errorResponse;
const createToken = require('../../helper-functions').createToken;

module.exports = signIn = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;


    User.findOne({email: email}).then(user => {
        if(!user) return errorResponse(res, 404, "Email does not exist");
        if(!bcrypt.compareSync(password, user.password)) return errorResponse(res, 401, "Password is incorrect");

        // generate jwt
        const token = createToken(user.email, user._id, user.name, user.city);

        // push the jwt to the user's activeTokens array
        User.findByIdAndUpdate(user._id, { $push: { activeTokens: token }}).then(() => {
            // return user along with the token
            res.status(200).json({
                id: user._id,
                name: user.name,
                email: user.email,
                city: {id: user.city.city_id, name: user.city.city_name},
                token: token
            });

        }).catch(err => errorResponse(res, 500, err));

    }).catch(err => errorResponse(res, 500, err))
};