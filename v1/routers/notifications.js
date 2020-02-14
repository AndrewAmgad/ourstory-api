const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const getNotifications = require('../controllers/notifications/notifications').getNotifications;


router.get('/', checkAuth, getNotifications);

module.exports = router;