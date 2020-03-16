require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const NodeCache = require("node-cache");
const nodemailer = require("nodemailer");
const cors = require('cors');
var apn = require('apn');

// initialize express app
const app = express();

// allow cors
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// mongodb connection
mongoose.connect(
  process.env.DB_LINK,
  { useNewUrlParser: true, useFindAndModify: false, autoIndex: false, useUnifiedTopology: true }
).then(() => {
  console.log("MongoDB Connected")
}).catch(error => console.log(error));


mongoose.Promise = global.Promise;

// email transporter
module.exports.transporter = transporter = nodemailer.createTransport({
  service: 'Outlook365',
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.email,
    pass: process.env.emailPass
  }
});

// connect to Apple Push Notification service
var apnOptions = {
  token: {
    key: process.env.ApnAuthKey,
    keyId: process.env.keyId,
    teamId: process.env.teamId
  },
  production: false
};

module.exports.apnProvider = new apn.Provider(apnOptions);


// cache for active auth tokens
module.exports.jwtCache = new NodeCache();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// routes
const postsRouter = require('./v1/routers/posts');
const authRouter = require('./v1/routers/auth');
const locationRouter = require('./v1/routers/location');
const notificationRouter = require('./v1/routers/notifications');

app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/location', locationRouter);
app.use('/api/v1/notifications', notificationRouter);

module.exports = app;