const express = require('express');
const router = express.Router();

const register = require('../controllers/auth/register');
const signIn = require('../controllers/auth/signIn');
const profile = require('../controllers/auth/profile');
const checkAuth = require('../middleware/check-auth');
const signOut = require('../controllers/auth/signout');
const email = require('../controllers/auth/email');
const resetPass = require('../controllers/auth/reset-password');

router.post('/register', register);
router.post('/signin', signIn);
router.get('/profile', checkAuth, profile);
router.post('/signout', checkAuth, signOut.signOut);
router.get('/signoutall', checkAuth, signOut.signOutAll);
router.get('/sendverification', checkAuth, email.sendVerfication);
router.get('/verify/:user_id/:verification_code', email.verify);
router.get('/sendresetmail', resetPass.sendResetMail);
router.get('/verifypass/:user_id/:token', resetPass.verifyPass);
router.post('/resetpass', resetPass.changePassword)

module.exports = router;