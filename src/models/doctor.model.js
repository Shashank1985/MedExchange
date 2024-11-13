import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true,
        min: 4,
        default: null
    },
    DOB: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: false
    },
    specialization: {
        type: String,
        required: true,
        default: null
    },
    securityCode: {
        type: String,
        default: null
    },
    medicalLicense: {
        type: String, //filePath in s3.
        required: true,
        default: null
    },
    degree: {
        type: String, //filePath in s3.
        required: true,
        default: null
    },
    publishments: {
        type: Array,
        required: false
    },
    identityProof: {
        type: String,
        required: true,
        default: null
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    }]

});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;