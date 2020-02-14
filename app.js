require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const NodeCache = require("node-cache");

// initialize express app
const app = express();

// mongodb connection
mongoose.connect(
    process.env.DB_LINK,
    {useNewUrlParser: true, useFindAndModify: false, autoIndex: false, useUnifiedTopology: true}
).then(() => {
    console.log("MongoDB Connected")
}).
catch(error => console.log(error));
mongoose.Promise = global.Promise;


// cache for active auth tokens
module.exports.jwtCache = new NodeCache();


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// routes
const postsRouter = require('./v1/routers/posts');
const authRouter = require('./v1/routers/auth');
const locationRouter = require('./v1/routers/location');
const notificationRouter = require('./v1/routers/notifications');

app.use('/v1/posts', postsRouter);
app.use('/v1/auth', authRouter);
app.use('/v1/location', locationRouter);
app.use('/v1/notifications', notificationRouter);

module.exports = app;