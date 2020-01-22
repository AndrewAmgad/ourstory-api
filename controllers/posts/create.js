const Post = require('../../models/post');
const User = require('../../models/user');


const errorResponse = require('../../helper-functions').errorResponse;

module.exports.createPost = (req, res, next) => {
    const userData = req.userData;
    const content = req.body.content;

    if(!content) return errorResponse(res, 400, "Post content is required")

        const time = new Date().getTime();
        // create new post 
        const newPost = new Post({
            author: userData.name,
            city: {id: userData.city.city_id, name: userData.city.city_name},
            content: content,
            time: time,
            views: 0
        })


        newPost.save()
            .then((post) => {
                const newPost = post.toObject();
                delete newPost.__v
                res.status(200).json(newPost)
            })
            .catch((error) => errorResponse(res, 500, error.message));
};