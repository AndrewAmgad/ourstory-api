const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const getNotifications = require('../controllers/notifications/get-notifications');
const sendDeviceToken = require('../controllers/notifications/device-token');


router.get('/', checkAuth, getNotifications);
router.post('/sendtoken', checkAuth, sendDeviceToken);

module.exports = router;