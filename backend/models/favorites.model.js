import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemType"
    },

    itemType: {
      type: String,
      enum: ["Paper", "Notes"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Favorite", favoriteSchema);
