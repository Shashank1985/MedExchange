import Post from "../../models/post.model.js"

const viewPosts = async (req, res) => {
    const posts = await Post.find({});
    res.status(200).json(posts);
}

const viewPost = async (req, res) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
        res.status(404).send("Post not found, please check again.")
    } else {
        res.status(200).json(post);
    }
}

export { viewPosts, viewPost };