const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    role: { type: String, enum: ['doctor', 'patient'], required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    username: { type: String, unique: true, required: true, minlength: 5, maxlength: 25 },
    password: { type: String, required: true },
    specialty: { type: String, required: function() { return this.role === 'doctor'; } },
    experience: { type: Number, required: function() { return this.role === 'doctor'; }, min: 0, max: 80 },
    medicalHistory: { type: String, required: function() { return this.role === 'patient'; } },
});

module.exports = mongoose.model('User', UserSchema);
