const Post = require('../../../models/post');

const errorResponse = require('../../../helper-functions').errorResponse;
const filterByLocation = require('./filters').filterByLocation;
const filterByTrending = require('./filters').filterByTrending;

// minimum amount of views for a post to be on trending
const trendingLimit = 20;

module.exports = (req, res, next) => {
    const filter = req.query.filter;
    const userCity = req.userData.city.city_name;
    const userId = req.query.user_id;

    // verify if an integer is provided for pagination
    const page = Number.isNaN(parseInt(req.query.page, 10)) ? 0 : parseInt(req.query.page, 10);
    const pageLimit = Number.isNaN(parseInt(req.query.page_limit, 10)) ? 10 : parseInt(req.query.page_limit, 10);

    // check if page and page limit are numbers
    if (typeof page !== 'number' || typeof pageLimit !== 'number') return errorResponse(res, 400, "page and page_limit must be numbers");

    if (filter === "1") return filterByLocation(req, res, page, pageLimit);
    if (filter === "0") return filterByTrending(req, res, page, pageLimit);
    
    // modify the db query if a userId is provided to get only this user's posts
    const query = userId ? {author_id: userId} : {};

    // get all posts
    Post.find(query).skip(page && pageLimit ? (page - 1) * pageLimit : 0).limit(page !== 0 ? pageLimit : null).select("-__v -users_activity").lean().sort({ _id: -1 }).then(async (posts) => {
        // return total amount of posts in the collection
        const total = await Post.countDocuments(query);

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
