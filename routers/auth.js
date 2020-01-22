const express = require('express');
const router = express.Router();

const register = require('../controllers/auth/register');
const signIn = require('../controllers/auth/signIn');
const profile = require('../controllers/auth/profile');

const checkAuth = require('../middleware/check-auth');

router.post('/register', register);
router.post('/signin', signIn);
router.get('/profile', checkAuth, profile);

module.exports = router;