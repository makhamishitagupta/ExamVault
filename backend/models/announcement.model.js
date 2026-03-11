import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: { 
      type: String, 
      required: true,
      trim: true
    },
    important: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
