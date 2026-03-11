import Favorite from "../models/favorites.model.js";
import Paper from "../models/papers.model.js";
import Notes from "../models/notes.model.js"
import mongoose from "mongoose";

export const getMyFavorites = async (req, res) => {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate("item");

    res.status(200).json({status: "ok", favorites});
};

export const toggleFavorite = async (req, res) => {
  try {
    const { id: itemId } = req.params;
    const { itemType } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!["Paper", "Notes"].includes(itemType)) {
      return res.status(400).json({ message: "Invalid itemType" });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const existing = await Favorite.findOne({
      user: req.user._id,
      item: itemId,
      itemType
    });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.json({ favorited: false });
    }

    await Favorite.create({
      user: req.user._id,
      item: itemId,
      itemType
    });

    res.json({ favorited: true });

  } catch (err) {
    console.error("❌ toggleFavorite error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

