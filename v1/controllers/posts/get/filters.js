const Post = require('../../../models/post');
const errorResponse = require('../../../helper-functions').errorResponse;

// minimum amount of views for a post to be on trending
const trendingLimit = 20;

// find posts created near the registered user only
module.exports.filterByLocation = (req, res, page, pageLimit) => {

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
module.exports.filterByTrending = (req, res, page, pageLimit) => {
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

