import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    commenterType: {
        type: String,
        enum: ['Patient', 'Doctor'], // Allowed values
        required: true
    },
    commenter: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    post :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    content: {
        type: String,
        required: true
    },
    isAccepted: {
        type: Boolean,
        required: true,
        default: false,
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: {
            type: String,
            enum: ['Patient', 'Doctor']
        },
        default: null
    }],
    upvotesCount: {
        type: Number,
        default: 0
    }
});

const Answer = mongoose.model('Answer', answerSchema);
export default Answer;