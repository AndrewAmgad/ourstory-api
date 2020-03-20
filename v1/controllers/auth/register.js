const User = require('../../models/user');
var bcrypt = require('bcryptjs');
const errorResponse = require('../../helper-functions').errorResponse;
const createToken = require('../../helper-functions').createToken;
const fs = require('fs');
const sendVerification = require('./email').sendVerfMail;


// Checks if text matches a proper email format
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validatePassword(password) {
    var re = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
    return re.test(password);
}

// get details about provided city_id
function getCity(cityId) {
    let countriesFile = fs.readFileSync('cities.json');
    let countries = JSON.parse(countriesFile);
    var country;

    for (var j = 0; j < countries.length; j++) {
        for (var i = 0; i < countries[j].cities.length; i++) {
            if (countries[j].cities[i].id === cityId) {
                country = {
                    country_id: countries[j].id,
                    country_name: countries[j].name,
                    city_id: countries[j].cities[i].id,
                    city_name: countries[j].cities[i].name
                };
                return country;
            };
        };
    };
};

module.exports = register = (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const cityId = req.body.city_id;
    const password = req.body.password;

    // search for the user email on the database
    User.find({ email: email }).then(user => {
        var error = false;
        var errors = {};

        // Error handling and input validation
        if (user && user.length >= 1) return errorResponse(res, 409, "An account with this email already exists");
        if (!validateEmail(email)) { error = true; errors.email_error = "Email format is invalid"; }
        if (!email || email.length > 200) { error = true; errors.email_error = "Email is too short or too long"; }
        if (name === undefined || name === "") { error = true; errors.name_error = "name has to be provided"; }
        if (!password || password.length < 8 || password.length > 50) { error = true; errors.password_error = "Password is too short or too long"; }
        if (!validatePassword(password)) { error = true; errors.password_error = "Password must be a mixture of both characters and numbers" }

        // send back an error if any of the above conditions return one
        if (error) return errorResponse(res, 400, errors);


        // generate password hash
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);

        const city = getCity(cityId);
        if (city === undefined) return errorResponse(res, 400, "Invalid city ID");

        // create new user
        const newUser = new User({
            email: email,
            name: name,
            password: hash,
            city: city,
            notificationSettings: { userActivity: true, userPosts: true },
            blockedUsers: []
        });

        // save user to the database
        newUser.save()
            .then(result => {
                // create jwt
                const token = createToken(result.email, result._id, result.name, result.city);

                // send verification email
                sendVerification(req, res, true, result._id);

                // add created jwt to the user's database document
                newUser.activeTokens = [token];

                newUser.save().then(() => {
                    // return user along with the token
                    res.status(200).json({
                        id: result._id,
                        name: result.name,
                        email: result.email,
                        city: { id: result.city.city_id, name: result.city.city_name },
                        token: token
                    });
                })

            }).catch(err => errorResponse(res, 500, err.message));
    })
};