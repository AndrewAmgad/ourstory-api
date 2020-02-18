const express = require('express');
const router = express.Router();

const fetchPosts = require('../controllers/posts/fetch');
const createPosts = require('../controllers/posts/create');
const checkAuth = require('../middleware/check-auth');
const comments = require('../controllers/posts/comments');
const deletePost = require('../controllers/posts/delete');

router.get('/', checkAuth, fetchPosts.getAll);
router.get('/:post_id', checkAuth, fetchPosts.getPost);
router.get('/:post_id/comments', checkAuth, comments.getComments);
router.post('/:post_id/comments', checkAuth, comments.postComment);
router.post('/', checkAuth, createPosts.createPost);
router.delete('/:post_id', checkAuth, deletePost)


module.exports = router;