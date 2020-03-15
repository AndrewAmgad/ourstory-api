const User = require('../../models/user');
const transporter = require('../../../app').transporter;
const errorResponse = require('../../helper-functions').errorResponse;
const cryptoRandomString = require('crypto-random-string');
var handlebars = require('handlebars');

var fs = require('fs');

var readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

// Send email verification message. This function can be called from the register route by marking the 'register' boolean parameter as true.
module.exports.sendVerfMail = sendVerfMail = async (req, res, register, user_id) => {
    const userId = !register ? req.userData.userId : user_id;

    // check whether the user is verified or not before proceeding
    const user = await User.findById(userId).catch(err => !register ? errorResponse(res, 500, err.message) : console.log(err));
    if (user.verified) return errorResponse(res, 400, "User is already verified");

    /// generate verification token
    const token = cryptoRandomString({ length: 20, type: 'url-safe' });

    // add the verification string to the user's object on the database
    User.findByIdAndUpdate(userId, { verfCode: token }).catch(err => !register ? errorResponse(res, 500, err.message) : console.log(err));

    // email body, this is temporary 
    const htmlMail = `
        <b> Email Verification </b><br />
        By clicking the link below, you verify registering to Our Story using this email address. You can ignore this email if you did not attempt this registration.
        <br />
        <a href="${process.env.baseUrl}/api/v1/auth/verify/${user._id}/${token}">${process.env.baseUrl}/api/v1/auth/verify/${user._id}/${token}</a>
        `

    readHTMLFile(__dirname + '/index.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            urlCode: `${user._id}/${token}`
        }
        var htmlToSend = template(replacements);
        let mailOptions = {
            from: 'ourstory51@outlook.com',
            to: user.email,
            subject: 'Email Verification',
            html: htmlToSend
        };

        transporter.sendMail(mailOptions, (err, data) => {
            if (err) return !register ? errorResponse(res, 500, err.message) : console.log(err);

            // return only a console log if this function is called by the register route to avoid sending multiple responses
            if (!register) {
                res.status(200).json({
                    message: "Email verification sent"
                })
            } else {
                console.log("Email verifiaction sent");
            }

        });
    })

}

module.exports.sendVerfication = async (req, res, next) => {
    sendVerfMail(req, res, false, null);
};

module.exports.verify = async (req, res, next) => {
    // grab the verification code from the parameters and check if it matches the one stored in the database
    const userId = req.params.user_id;
    const verfCode = req.params.verification_code;

    const user = await User.findById(userId);

    // check if the account has been verified before
    if (user.verified) res.end("Your account is already verified.");

    // check if the verification code matches the user's, mark the account as verified if it does
    if (user.verfCode === verfCode) {

        User.findByIdAndUpdate(userId, { verified: true, verifCode: "" }).then((user) => {
            res.end("Your account has been verified successfully")
        }).catch(err => res.end("Something went wrong, try again later."));

    } else {
        res.end("Something went wrong, try again later.")
    };

};