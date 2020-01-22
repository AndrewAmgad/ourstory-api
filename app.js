require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// initialize express app
const app = express();

mongoose.connect(
    process.env.DB_LINK,
    {useNewUrlParser: true, useFindAndModify: false, autoIndex: false, useUnifiedTopology: true}
).then(() => {
    console.log("MongoDB Connected")
}).
catch(error => console.log(error));

mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// routes
const postsRouter = require('./routers/posts');
const authRouter = require('./routers/auth');
const locationRouter = require('./routers/location');

app.use('/posts', postsRouter);
app.use('/auth', authRouter);
app.use('/location', locationRouter)

module.exports = app;