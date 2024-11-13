import Post from "../../models/post.model.js";
import Patient from "../../models/patient.model.js";

const createPost = async (req, res) => {
    try {
        const title = req.body.title;
        const content = req.body.content;
        const patient = req.id;

        if (!title || !content) {
            res.status(400).send('All fields are required');
        } else {
            const newPost = await Post.create({
                title,
                content,
                patient
            })
    
            const patientFound = await Patient.findByIdAndUpdate(
                patient,
                { $push: {posts: newPost._id} }
            );

    
            res.status(200).json(newPost);
        }
    
    } catch (error) {
        console.log(error);
        res.send("Some error occurred while creating the post.")
    }

}


const viewPost = async (req, res) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
        res.status(404).send("Post not found, please check again.")
    } else {
        const creator = post.patient;
        console.log(creator);
        console.log(req.id);
        if (creator.toString() !== req.id) {
            res.send("Cannot access the posts of another patient.")
        } else {
            res.status(200).json(post);
        }
    }
}

const viewSolvedPosts = async (req, res) => {
    const posts = await Post.find(
        {
            solved: true,
            patient: req.id
        }
    );
    res.status(200).json(posts);
}


export { createPost, viewPost, viewSolvedPosts };