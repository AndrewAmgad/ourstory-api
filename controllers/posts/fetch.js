const Post = require('../../models/post');
const User = require('../../models/user');

const errorResponse = require('../../helper-functions').errorResponse;

// find posts created near the registered user only
function filterByLocation(req, res) {

    // retrieve user's city from jwt
    const userCity = { id: req.userData.city.city_id, name: req.userData.city.city_name };

    // find posts created in the same city as the user's.
    Post.find({ city: userCity }).select("-__v").lean().sort({ _id: -1 }).then(posts => {
        // return an error if no posts are found
        if (posts.length < 1) return errorResponse(res, 404, "Could not find any posts near you.");

        posts.map(post => {
            ;
            post.tag = { id: 1, name: "Near you" }
        });

        res.status(200).json(posts);
    });
};

// get the 10 most views posts of the last 7 days.
function filterByTrending(req, res) {
    Post.find({ time: { $gte: new Date() - 7 * 60 * 60 * 24 * 1000 } }).select("-__v").sort({ views: -1 }).limit(10).lean().sort({ _id: -1 }).then(posts => {

        posts.map(post => {
            post.tag = { id: 0, name: "Trending" }
        });

        res.status(200).json(posts);
    }).catch(err => errorResponse(res, 500, err.message));
};

module.exports.getAll = (req, res, next) => {
    const filter = req.query.filter;
    
    // verify if an integer is provided
    const page = Number.isNaN(parseInt(req.query.page, 10)) ? 0 : parseInt(req.query.page, 10);
    const pageLimit = Number.isNaN(parseInt(req.query.page_limit, 10)) ? 10 : parseInt(req.query.page_limit, 10);

    // check if page and page limit are numbers
    if (typeof page !== 'number' || typeof pageLimit !== 'number') return errorResponse(res, 400, "page and page_limit must be numbers");

    if (filter === "1") return filterByLocation(req, res);
    if (filter === "0") return filterByTrending(req, res);

    // get all posts
    Post.find().skip(page && pageLimit ? (page - 1) * pageLimit : 0).limit(page !== 0 ? pageLimit : null).select("-__v").lean().sort({ _id: -1 }).then(posts => {
        res.status(200).json({ page: page, posts })
    }).catch(err => errorResponse(res, 500, err.message));
};

module.exports.getPost = (req, res, next) => {
    const postId = req.params.post_id;
    const userCity = req.userData.city.city_name;

        Post.findByIdAndUpdate(postId, {$inc : {'views' : 1}}).select('-__v').then((post => {
            console.log(post._id)
            if (userCity === post.city.name) post.tag = { id: 1, name: "Near you" };
            res.status(200).json(post);
        })).catch(err => errorResponse(res, 500, err.message));

};
