const Post = require('../../models/post');
const Comment = require('../../models/comment');
const User = require('../../models/user');
const mongoose = require('mongoose');

const errorResponse = require('../../helper-functions').errorResponse;

// hide the posts the user had reported / hidden previously as well as posts from blocked users
async function filterComments(userId, comments) {
    const user = await User.findById(userId).catch(err => errorResponse(res, 500, err.message));
    const blockedUsers = user.blockedUsers;

    // remove the posts the user had reported / hidden previously as well as posts from blocked users
    var filter = comments.filter(comment => (!comment.hidden_from.includes(userId) && !blockedUsers.includes(comment.author_id)));

    return filter;
};

// get all comments for one post
module.exports.getAll = (req, res, next) => {
    const postId = req.params.post_id;
    const userId = req.userData.userId;

    // verify if an integer is provided for pagination
    const page = Number.isNaN(parseInt(req.query.page, 10)) ? 0 : parseInt(req.query.page, 10);
    const pageLimit = Number.isNaN(parseInt(req.query.page_limit, 10)) ? 10 : parseInt(req.query.page_limit, 10);

    // check if page and page limit are numbers
    if (typeof page !== 'number' || typeof pageLimit !== 'number') return errorResponse(res, 400, "page and page_limit must be numbers");


    // validate received post ID
    if (!postId) return errorResponse(res, 400, "Post ID must be provided");
    if (!mongoose.Types.ObjectId.isValid(postId)) return errorResponse(res, 400, 'Invalid post ID')

    // find all comments for provided post ID
    Comment.find({ post_id: postId })
        .skip(page && pageLimit ? (page - 1) * pageLimit : 0)
        .limit(page !== 0 ? pageLimit : null)
        .select("-__v -post_id").lean().sort({ _id: -1 }).then(async (comments) => {
            // total amount of comments
            const total = await Comment.countDocuments({ post_id: postId });

            // check if there are more comments in the next page
            const hasMore = (pageLimit * page) < total && (page !== 0) ? true : false;

            var commentsFilter = await filterComments(userId, comments)

            commentsFilter.map((comment) => {

                // add the can_edit property if the requesting user is the author
                if (comment.author_id.toString() === userId.toString()) {
                    comment.can_edit = true;
                } else {
                    comment.can_edit = false;
                };

                // remove author_id from the response if the comment is marked as anonymous
                if (comment.anonymous === true) delete comment.author_id;

                // replace _id with id
                comment.id = comment._id;

                ['_id', 'anonymous', 'hidden_from'].forEach(e => delete comment[e]);
            });

            // response
            res.status(200).json({
                has_more: hasMore,
                total: commentsFilter.length,
                page: page,
                comments: commentsFilter
            })
        });
};
