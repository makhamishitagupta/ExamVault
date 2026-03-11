import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    year: Number,
    lab: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('Subject', subjectSchema);