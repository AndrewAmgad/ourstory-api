const User = require('../../models/user');

const errorResponse = require('../../helper-functions').errorResponse;

const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");

module.exports.sendVerfication = async (req, res, next) => {
    const userId = req.userData.userId;

    // check whether the user is verified or not before proceeding
    const user = await User.findById(userId).catch(err => errorResponse(res, 500, err.message));
    if(user.verified) return errorResponse(res, 400, "User is already verified");

    // generate verification string
    var salt = bcrypt.genSaltSync(10);

    // add the verification string to the user's object on the database
    User.findByIdAndUpdate(userId, {verfCode: salt}).catch(err => errorResponse(res, 500, err.message));

    // email transporter
    let transporter = nodemailer.createTransport({
        service: 'Outlook365',
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.email,
            pass: process.env.emailPass
        }
    });

    // email body, this is temporary 
    const htmlMail = `
        <b> Email Verification </b><br />
        By clicking the link below, you verify registering to Our Story using this email address. You can ignore this email if you did not attempt this registration.
        <br />
        <a href="${process.env.baseUrl}/v1/auth/verify/${user._id}/${salt}">l${process.env.baseUrl}/v1/auth/verify/${user._id}/${salt}</a>
        `
    

    let mailOptions = {
        from: 'ourstory51@outlook.com',
        to: user.email,
        subject: 'Email Verification',
        html: htmlMail
    };

    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200).json({
                message: "Email verification sent"
            })
        }

    });
};

module.exports.verify = async (req, res, next) => {
    // grab the verification code from the parameters and check if it matches the one stored in the database
    const userId = req.params.user_id;
    const verfCode = req.params.verification_code;

    const user = await User.findById(userId);

    // check if the account has been verified before
    if(user.verified) res.end("Your account is already verified.");

    // check if the verification code matches the user's, mark the account as verified if it does
    if(user.verfCode === verfCode) {
        User.findByIdAndUpdate(userId, {verified: true, verifCode: ""}).then((user) => {
            res.end("Your account has been verified successfully")
        }).catch(err => res.end("Something went wrong, try again later."));
    } else {
        res.end("Something went wrong, try again later.")
    };

};