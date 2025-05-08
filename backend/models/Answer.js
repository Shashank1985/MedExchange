const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answer: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    parentAnswerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', default: null, index: true}
});

module.exports = mongoose.model('Answer', answerSchema);
