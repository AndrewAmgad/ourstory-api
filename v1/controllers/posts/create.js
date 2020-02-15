const Post = require('../../models/post');
const User = require('../../models/user');


const errorResponse = require('../../helper-functions').errorResponse;

module.exports.createPost = (req, res, next) => {
    const userData = req.userData;
    const content = req.body.content;
    const anonymous = req.body.anonymous;
    
    if(!content) return errorResponse(res, 400, "Post content is required")

        const time = new Date().getTime();
        // create new post 
        const newPost = new Post({
            author: anonymous === true ? "Anonymous" : userData.name,
            author_id: userData.userId,
            city: {id: userData.city.city_id, name: userData.city.city_name},
            content: content,
            time: time,
            anonymous: anonymous === true ? true : false,
            views: 0
        })


        newPost.save()
            .then((post) => {
                const newPost = post.toObject();

                if(anonymous === true) delete newPost.author_id;

                // rename _id to id
                newPost.id = newPost._id;
                delete newPost._id
                delete newPost.__v
                delete newPost.anonymous
                
                res.status(200).json(newPost)
            })
            .catch((error) => errorResponse(res, 500, error.message));
};