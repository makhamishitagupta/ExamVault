import mongoose from "mongoose";

const notesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    unit: {
        type: Number,
        required: true
    },

    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },  

    year: {
        type: Number,
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
        ref: 'User'
    }],

    isActive: {
        type: Boolean,
        default: true
    }
});

const Notes = mongoose.model('Notes', notesSchema);
export default Notes;