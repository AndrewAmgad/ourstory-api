const express = require('express');
const router = express.Router();

// middleware
const checkAuth = require('../middleware/check-auth');

// posts
const fetchAll = require('../controllers/posts/get/get-all');
const fetchOne = require('../controllers/posts/get/get-one');
const createPosts = require('../controllers/posts/create');
const deletePost = require('../controllers/posts/delete');

// comments
const getComments = require('../controllers/comments/get');
const postComment = require('../controllers/comments/post');
const deleteComment = require('../controllers/comments/delete');

router.get('/', checkAuth, fetchAll);
router.get('/:post_id', checkAuth, fetchOne);
router.post('/', checkAuth, createPosts.createPost);
router.delete('/:post_id', checkAuth, deletePost);

router.get('/:post_id/comments', checkAuth, getComments.getAll);
router.post('/:post_id/comments', checkAuth, postComment);
router.delete('/:post_id/comments/:comment_id', checkAuth, deleteComment);


module.exports = router;