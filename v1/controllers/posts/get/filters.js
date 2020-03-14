const Post = require('../../../models/post');
const errorResponse = require('../../../helper-functions').errorResponse;

// minimum amount of views for a post to be on trending
const trendingLimit = 20;

// find posts created near the registered user only
module.exports.filterByLocation = (req, res, page, pageLimit) => {
    const userData = req.userData;

    // retrieve user's city from jwt
    const userCity = { id: req.userData.city.city_id, name: req.userData.city.city_name };


    // find posts created in the same city as the user's.
    Post.find({ city: userCity })
        .skip(page && pageLimit ? (page - 1) * pageLimit : 0).limit(page !== 0 ? pageLimit : null)
        .select("-__v -users_activity").lean().sort({ _id: -1 })
        .then(async (posts) => {
            // total amount of trending posts
            const total = await Post.countDocuments({ city: userCity });

            // check if there are more posts in the next page
            const hasMore = (pageLimit * page) < total && (page !== 0) ? true : false;


            if (posts.length > 0) {
                posts.map(post => {
                    // add can_edit property to the response if the requesting user is the author
                    if (post.author_id.toString() === userData.userId.toString()) post.can_edit = true;

                    // Add post tags, allowing the "trending" tag to override the "near you" if it applies. 
                    post.tag = { id: 1, name: "Near you" }
                    if (post.views > trendingLimit && post.last_view > new Date() - 7 * 60 * 60 * 24 * 1000) post.tag = { id: 0, name: "Trending" }

                    // remove author ID from the response if it is classified as anonymous
                    if (post.anonymous === true) delete post.author_id;

                    // rename _id to id and remove the anonymous property
                    post.id = post._id;
                    ['_id', 'anonymous'].forEach(e => delete post[e]);
                });
            };

            // response
            res.status(200).json({
                has_more: hasMore,
                total: total,
                page: page,
                posts: posts
            });
        }).catch(err => errorResponse(res, 500, err.message));
};

// get the 10 most views posts of the last 7 days.
module.exports.filterByTrending = (req, res, page, pageLimit) => {
    const userData = req.userData;
    
    Post.find({ last_view: { $gte: new Date() - 7 * 60 * 60 * 24 * 1000 }, views: { $gte: trendingLimit } })
        .skip(page && pageLimit ? (page - 1) * pageLimit : 0).limit(page !== 0 ? pageLimit : null)
        .select("-__v -users_activity").sort({ views: -1 }).lean().sort({ _id: -1 })

        .then(async (posts) => {
            // total amount of trending posts
            const total = await Post.countDocuments({ last_view: { $gte: new Date() - 7 * 60 * 60 * 24 * 1000 }, views: { $gte: trendingLimit } });

            // check if there are more posts in the next page
            const hasMore = (pageLimit * page) < total && (page !== 0) ? true : false;

            if (posts.length > 0) {
                posts.map(post => {
                    // add can_edit property to the response if the requesting user is the author
                    if (post.author_id.toString() === userData.userId.toString()) post.can_edit = true;


                    post.tag = { id: 0, name: "Trending" }
                    if (post.anonymous === true) delete post.author_id;

                    // rename _id to id and remove the anonymous property
                    post.id = post._id;
                    ['_id', 'anonymous'].forEach(e => delete post[e]);
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

