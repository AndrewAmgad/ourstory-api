const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const notifications = require('../controllers/notifications/notifications');


router.get('/', checkAuth, notifications.getNotifications);
router.post('/sendtoken', checkAuth, notifications.sendDeviceToken);

module.exports = router;