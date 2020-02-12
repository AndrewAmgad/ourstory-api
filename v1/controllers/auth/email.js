const User = require('../../models/user');

const errorResponse = require('../../helper-functions').errorResponse;

var bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");

module.exports.sendVerfication = (req, res, next) => {
    const userId = req.userData.userId;
    console.log(userId)
    // check whether the user is verified or not before proceeding

    User.findById(userId).then(user => {
        if (user.verified) return errorResponse(res, 400, "Account is already verified");
    });

    // generate verification string
    var salt = bcrypt.genSaltSync(10);

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

    let mailOptions = {
        from: 'ourstory51@outlook.com',
        to: 'andrewamgad30@gmail.com',
        subject: 'Testing and testing',
        text: salt
    };

    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log("email sent!")
        }

    });
};

module.exports.verify = (req, res, next) => {
    // grab the verification code from the parameters and check if it matches the one stored in the database

};