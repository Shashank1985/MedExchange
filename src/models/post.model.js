import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer',
        default: null
    }],
    solved: {
        type: Boolean,
        default: false 
    }


});

const Post = mongoose.model('Post', postSchema);
export default Post;