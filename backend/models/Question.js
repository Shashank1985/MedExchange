const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    answers: [String]
});

module.exports = mongoose.model('Question', questionSchema);
