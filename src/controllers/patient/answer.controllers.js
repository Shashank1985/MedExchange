import Post from "../../models/post.model.js";
import Answer from "../../models/answer.model.js";
import Patient from "../../models/patient.model.js"

const createAnswer = async (req, res) => {
    try {
        const content = req.body.content;
        const patient = req.id;
        const post = req.params.postId;

        if (!content || !post) {
            res.status(400).send('All fields are required');
        } else {
            const checkPost = await Post.findById(post);
            if (!checkPost) {
                res.status(404).send("Post not found. Please check agian.")
            } else {
                if (checkPost.patient.toString() !== patient) {
                    res.status(404).send("Cannot comment on another patient's posts.")
                } else {
                    const answer = await Answer.create({
                        commenter: patient,
                        commenterType: "Patient",
                        post,
                        content
                    })
    
                    try {
                        checkPost["answers"].push(answer._id);
                        await checkPost.save();
                        const updateAnswers = await Patient.findByIdAndUpdate(
                            patient,
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
        }
    
    } catch (error) {
        console.log(error);
        res.send("Some error occurred while creating the post.")
    }

}

const acceptAnswer = async (req, res) => {
    const answerId = req.params.answerId;
    const answer = await Answer.findById(answerId)
    if (!answer) {
        res.status(404).send("No such answer found.")
    } else {
        const post = await Post.findById(answer.post);
        if (post.solved) {
            res.send("This post has already been solved.")
        } else if (answer.commenter.toString() === req.id) {
            res.send("Cannot accept your own answer.")
        } else {
            answer.isAccepted = true;
            post.solved = true;

            post.save()
            .then((doc) => {
                answer.save()
                .then(()=>{
                    res.status(200).json(doc);
                }).catch(()=>{
                    res.send("Error occurred while updating user")
                })
            }).catch(err => res.send("Error occurred while marking post as accepted."));
        }
        
    }
}


const upvoteAnswer = async (req, res) => {
    const answerId = req.params.answerId;
    const id = req.id;
    const answer = await Answer.findById(answerId)
    if (!answer) {
        res.status(404).send("No such answer found.")
    } else {
        if (answer.upvotes.some(objId => objId.equals(id))) {
            res.send("Cannot upvote the answer again");
        } else if (answer._id === id) {
            res.send("Cannot upvote your own answer");
        } else {
            answer.upvotesCount += 1;
            answer.upvotes.push(id);
            answer.save()
                .then(updatedAns => res.status(200).json(updatedAns))
                .catch(err => res.send("Error occurred while upvoting answer: ", err));
        }
    }
}

export { createAnswer, acceptAnswer, upvoteAnswer };