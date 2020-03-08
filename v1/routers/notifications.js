const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const getNotifications = require('../controllers/notifications/get-notifications');
const sendDeviceToken = require('../controllers/notifications/device-token');
const settings = require('../controllers/notifications/settings');


router.get('/', checkAuth, getNotifications);
router.post('/sendtoken', checkAuth, sendDeviceToken);
router.post('/settings', checkAuth, settings.updateSettings);
router.get('/settings', checkAuth, settings.getSettings);

module.exports = router;