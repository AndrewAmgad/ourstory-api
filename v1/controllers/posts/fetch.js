const Post = require('../../models/post');
const User = require('../../models/user');

const errorResponse = require('../../helper-functions').errorResponse;

// find posts created near the registered user only
function filterByLocation(req, res) {

    // verify if an integer is provided for pagination
    const page = Number.isNaN(parseInt(req.query.page, 10)) ? 0 : parseInt(req.query.page, 10);
    const pageLimit = Number.isNaN(parseInt(req.query.page_limit, 10)) ? 10 : parseInt(req.query.page_limit, 10);

    // check if page and page limit are numbers
    if (typeof page !== 'number' || typeof pageLimit !== 'number') return errorResponse(res, 400, "page and page_limit must be numbers");


    // retrieve user's city from jwt
    const userCity = { id: req.userData.city.city_id, name: req.userData.city.city_name };

    // find posts created in the same city as the user's.
    Post.find({ city: userCity }).skip(page && pageLimit ? (page - 1) * pageLimit : 0).limit(page !== 0 ? pageLimit : null).select("-__v").lean().sort({ _id: -1 }).then(posts => {
        // return an error if no posts are found
        if (posts.length < 1) return res.status(200).json([]);

        posts.map(post => {

            // Add post tags, allowing the "trending" tag to override the "near you" if it applies. 
            post.tag = { id: 1, name: "Near you" }
            if (post.views > 20 && post.last_view > new Date() - 7 * 60 * 60 * 24 * 1000) post.tag = { id: 0, name: "Trending" }

            if (post.anonymous === true) delete post.author_id;

            // rename _id to id
            post.id = post._id;
            delete post._id;
            delete post.anonymous;
        });

        res.status(200).json(posts);
    });
};

// get the 10 most views posts of the last 7 days.
function filterByTrending(req, res) {
    Post.find({ last_view: { $gte: new Date() - 7 * 60 * 60 * 24 * 1000 }, views: { $gte: 20 } }).select("-__v").sort({ views: -1 }).lean().sort({ _id: -1 }).then(posts => {
        if (posts.length < 1) return res.status(200).json([]);

        posts.map(post => {
            post.tag = { id: 0, name: "Trending" }
            if (post.anonymous === true) delete post.author_id;

            // rename _id to id
            post.id = post._id;
            delete post._id;
            delete post.anonymous;
        });

        res.status(200).json(posts);
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

    if (filter === "1") return filterByLocation(req, res);
    if (filter === "0") return filterByTrending(req, res);

    // get all posts
    Post.find().skip(page && pageLimit ? (page - 1) * pageLimit : 0).limit(page !== 0 ? pageLimit : null).select("-__v").lean().sort({ _id: -1 }).then(posts => {
        if (posts.length < 1) return res.status(200).json([]);

        posts.map(post => {
            // remove author_id if the post is anonymous
            if (post.anonymous === true) delete post.author_id;

            // Add post tags, allowing the "trending" tag to override the "near you" one if both apply. 
            if (userCity === post.city.name) post.tag = { id: 1, name: "Near you" }
            if (post.views > 20 && post.last_view > new Date() - 7 * 60 * 60 * 24 * 1000) post.tag = { id: 0, name: "Trending" }


            // rename _id to id
            post.id = post._id;
            delete post._id;
            delete post.anonymous;

        });
        res.status(200).json(posts)
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
        if (post.views > 20 && post.last_view > new Date() - 7 * 60 * 60 * 24 * 1000) post.tag = { id: 0, name: "Trending" }

        // replace _id with id
        post.id = post._id;
        delete post._id

        // remove author_id if post is anonymous
        if (post.anonymous) delete post.author_id;
        delete post.anonymous

        res.status(200).json(post);
    })).catch(err => errorResponse(res, 500, err.message));

};
