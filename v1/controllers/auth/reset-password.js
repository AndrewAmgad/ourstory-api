const User = require('../../models/user');
const errorResponse = require('../../helper-functions').errorResponse;

const cryptoRandomString = require('crypto-random-string');
const transporter = require('../../../app').transporter;

const bcrypt = require('bcryptjs');

function validatePassword(password) {
    var re = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
    return re.test(password);
};


// send change password email
module.exports.sendResetMail = async (req, res, next) => {
     const email = req.body.email;
     if(!email) return errorResponse(res, 400, "Email is required");

    // generate verification token
    const token = cryptoRandomString({ length: 20, type: 'url-safe' });

    const salt = bcrypt.genSaltSync(10);
    const tokenHash = bcrypt.hashSync(token, salt);

    const passChange = { token: tokenHash, time: new Date().getTime()}
    const user = await User.findOneAndUpdate({email: email}, { passChange: passChange }).catch(err => errorResponse(res, 500, err.message));

    if(!user) return errorResponse(res, 404, "Entered email does not exist")

    // email body, this is temporary 
    const html = `
          <b> Password Change</b><br />
          Visit the URL below to reset your password. Please note that this URL is only valid for 2 hours.
          <br />
          <a href="${process.env.baseUrl}/v1/auth/verifypass/${user._id}/${token}">${process.env.baseUrl}/v1/auth/verifypass/${user._id}/${token}</a>
          `

    let mailOptions = {
        subject: 'ourstory51@outlook.com',
        to: user.email,
        subject: 'Password Change',
        html: html
    };

    transporter.sendMail(mailOptions, (err, data) => {
        if (err) return errorResponse(res, 500, err.message)

        res.status(200).json({
            message: "Email sent"
        });
    })
};

// verify password change
module.exports.verifyPass = async (req, res, next) => {
    const userId = req.params.user_id;
    const token = req.params.token;

    const user = await User.findById(userId).catch(err => errorResponse(res, 500, err.message));

    const currentTime = new Date().getTime();

    // return a message if the token does not match the user's.
    if (!bcrypt.compareSync(token, user.passChange.token)) return res.send("Invalid token");

    // return an error if the token has been issued over 2 hours ago.
    if (currentTime - user.passChange.time > 7200000) return res.send("Token expired");

    // Redirect should happen right here
    console.log("Token verified");
    
    res.redirect(process.env.clientUrl + `/user/resetpass/${userId}/${token}`)

};

// change password endpoint, gets called by the react app
module.exports.changePassword = async (req, res, next) => {
    const userId = req.body.user_id;
    const token = req.body.token;
    const newPassword = req.body.new_password;
    const currentTime = new Date().getTime();

    const user = await User.findById(userId).catch(err => errorResponse(res, 500, err.message));
    if (!user) return errorResponse(res, 404, "User not found");

    // return a message if the token does not match the user's.
    if (!bcrypt.compareSync(token, user.passChange.token)) return errorResponse(res, 401, "Invalid token")

    // return an error if the token has been issued over 2 hours ago.
    if ((user.passChange.time - currentTime) > 7200000) return errorResponse(res, 401, "Token expired")

    // password validation
    if (!newPassword || newPassword.length < 8 || newPassword.length > 50) return errorResponse(res, 400, "Password is too short or too long")
    if (!validatePassword(password)) return errorResponse(res, 400, "Password must be a mixture of both characters and numbers");

    // generate password hash
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    // change password
    User.findByIdAndUpdate(userId, { password: passwordHash, passChange: {} }).then((user) => {
        res.status(200).json({ success: true, message: "Password changed successfully" })
    }).catch(err => errorResponse(res, 500, err.message));

};