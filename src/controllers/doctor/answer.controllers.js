import Post from "../../models/post.model.js";
import Answer from "../../models/answer.model.js";
import Doctor from "../../models/doctor.model.js"

const createAnswer = async (req, res) => {
    try {
        const content = req.body.content;
        const doctor = req.id;
        const post = req.params.postId;

        if (!content || !post) {
            res.status(400).send('All fields are required');
        } else {
            const checkPost = await Post.findById(post);
            if (!checkPost) {
                res.status(404).send("Post not found. Please check agian.")
            } else {
                const answer = await Answer.create({
                    commenter: doctor,
                    commenterType: "Doctor",
                    post,
                    content
                })

                try {
                    checkPost["answers"].push(answer._id);
                    await checkPost.save();
                    const updateAnswers = await Doctor.findByIdAndUpdate(
                        doctor,
                        { $push: {answers: answer._id} },
                        { new: true }
                    );
            
                    res.status(200).json(updateAnswers);
                } catch (error) {
                    console.log("Error occurred while updating answer: ", error);
                    res.send(error);
                }
                
            }
        }
    
    } catch (error) {
        console.log(error);
        res.send("Some error occurred while creating the post.")
    }

}

export default createAnswer;