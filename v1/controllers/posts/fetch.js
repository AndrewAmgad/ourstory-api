const Post = require('../../models/post');
const User = require('../../models/user');

const errorResponse = require('../../helper-functions').errorResponse;

// minimum amount of views for a post to be on trending
const trendingLimit = 20;

// find posts created near the registered user only
function filterByLocation(req, res, page, pageLimit) {

    // retrieve user's city from jwt
    const userCity = { id: req.userData.city.city_id, name: req.userData.city.city_name };

    // find posts created in the same city as the user's.
    Post.find({ city: userCity })
        .skip(page && pageLimit ? (page - 1) * pageLimit : 0).limit(page !== 0 ? pageLimit : null)
        .select("-__v").lean().sort({ _id: -1 })
        .then(async (posts) => {
            // total amount of trending posts
            const total = await Post.countDocuments({ city: userCity });

            // check if there are more posts in the next page
            const hasMore = (pageLimit * page) < total && (page !== 0) ? true : false;


            if (posts.length > 0) {
                posts.map(post => {
                    // Add post tags, allowing the "trending" tag to override the "near you" if it applies. 
                    post.tag = { id: 1, name: "Near you" }
                    if (post.views > trendingLimit && post.last_view > new Date() - 7 * 60 * 60 * 24 * 1000) post.tag = { id: 0, name: "Trending" }

                    // remove author ID from the response if it is classified as anonymous
                    if (post.anonymous === true) delete post.author_id;

                    // rename _id to id
                    post.id = post._id;
                    delete post._id;
                    delete post.anonymous;
                });
            };

            // response
            res.status(200).json({
                has_more: hasMore,
                total: total,
                page: page,
                posts: posts
            });
        });
};

// get the 10 most views posts of the last 7 days.
function filterByTrending(req, res, page, pageLimit) {
    Post.find({ last_view: { $gte: new Date() - 7 * 60 * 60 * 24 * 1000 }, views: { $gte: trendingLimit } })
        .skip(page && pageLimit ? (page - 1) * pageLimit : 0).limit(page !== 0 ? pageLimit : null)
        .select("-__v").sort({ views: -1 }).lean().sort({ _id: -1 })

        .then(async (posts) => {
            // total amount of trending posts
            const total = await Post.countDocuments({ last_view: { $gte: new Date() - 7 * 60 * 60 * 24 * 1000 }, views: { $gte: trendingLimit } });

            // check if there are more posts in the next page
            const hasMore = (pageLimit * page) < total && (page !== 0) ? true : false;

            if (posts.length > 0) {
                posts.map(post => {
                    post.tag = { id: 0, name: "Trending" }
                    if (post.anonymous === true) delete post.author_id;

                    // rename _id to id
                    post.id = post._id;
                    delete post._id;
                    delete post.anonymous;
                });
            }

            // response
            res.status(200).json({
                has_more: hasMore,
                total: total,
                page: page,
                posts: posts
            });

        }).catch(err => errorResponse(res, 500, err.message));
};

module.exports.getAll = (req, res, next) => {
    const filter = req.query.filter;
    const userCity = req.userData.city.city_name;

    // verify if an integer is provided for pagination
    const page = Number.isNaN(parseInt(req.query.page, 10)) ? 0 : parseInt(req.query.page, 10);
    const pageLimit = Number.isNaN(parseInt(req.query.page_limit, 10)) ? 10 : parseInt(req.query.page_limit, 10);

    // check if page and page limit are numbers
    if (typeof page !== 'number' || typeof pageLimit !== 'number') return errorResponse(res, 400, "page and page_limit must be numbers");

    if (filter === "1") return filterByLocation(req, res, page, pageLimit);
    if (filter === "0") return filterByTrending(req, res, page, pageLimit);

    // get all posts
    Post.find().skip(page && pageLimit ? (page - 1) * pageLimit : 0).limit(page !== 0 ? pageLimit : null).select("-__v").lean().sort({ _id: -1 }).then(async (posts) => {
        // return total amount of posts in the collection
        const total = await Post.countDocuments();

        // check if there are more posts in the next page
        const hasMore = (pageLimit * page) < total && (page !== 0) ? true : false;

        if (posts.length > 0) {
            posts.map(post => {
                // remove author_id if the post is anonymous
                if (post.anonymous === true) delete post.author_id;

                // Add post tags, allowing the "trending" tag to override the "near you" one if both apply. 
                if (userCity === post.city.name) post.tag = { id: 1, name: "Near you" }
                if (post.views > trendingLimit && post.last_view > new Date() - 7 * 60 * 60 * 24 * 1000) post.tag = { id: 0, name: "Trending" }

                // rename _id to id
                post.id = post._id;
                delete post._id;
                delete post.anonymous;

            });
        }

        // response
        res.status(200).json({
            has_more: hasMore,
            total: total,
            page: page,
            posts: posts
        });

    }).catch(err => errorResponse(res, 500, err.message));
};

module.exports.getPost = (req, res, next) => {
    const postId = req.params.post_id;
    const userCity = req.userData.city.city_name;
    const time = new Date().getTime();

    Post.findByIdAndUpdate(postId, { $inc: { 'views': 1 }, last_view: time }).select('-__v').lean().then((post => {
        if (!post) errorResponse(res, 404, "Post ID not found");

        // Add post tags, allowing the "trending" tag to override the "near you" one if both apply. 
        if (userCity === post.city.name) post.tag = { id: 1, name: "Near you" };
        if (post.views > trendingLimit && post.last_view > new Date() - 7 * 60 * 60 * 24 * 1000) post.tag = { id: 0, name: "Trending" }

        // replace _id with id
        post.id = post._id;
        delete post._id

        // remove author_id if post is anonymous
        if (post.anonymous) delete post.author_id;
        delete post.anonymous

        res.status(200).json(post);
    })).catch(err => errorResponse(res, 500, err.message));

};
