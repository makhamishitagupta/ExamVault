import mongoose from "mongoose";
import Subject from "./subject.model.js";

const paperSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    year: {
        type: Number
    },

    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },  

    examType: {
        type: String,
        enum: ['Mid1', 'Mid2', 'Sem', 'Other'],
        required: true
    },

    pdfUrl: {
        type: String,
        required: true
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true  
    },

    downloadCount: {
        type: Number,
        default: 0
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    isActive: {
        type: Boolean,
        default: true
    }
});

const Paper = mongoose.model('Paper', paperSchema);
export default Paper;