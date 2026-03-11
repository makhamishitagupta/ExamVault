import Comment from "../models/comment.model.js";
import mongoose from "mongoose";

export const getAllComments = async (req, res) => {
    const { itemType, itemId } = req.params;

    if (!["Paper", "Notes"].includes(itemType)) {
      return res.status(400).json({ message: "Invalid item type" });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const comments = await Comment.find({
      item: itemId,
      itemType
    })
      .populate("user", "name username")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
}

export const createComment = async (req, res) => {
    const { itemType, itemId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Comment content required" });
    }

    if (!["Paper", "Notes"].includes(itemType)) {
      return res.status(400).json({ message: "Invalid item type" });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const comment = await Comment.create({
      user: req.user._id,
      item: itemId,
      itemType,
      content
    });

    res.status(201).json({
      message: "Comment added successfully",
      comment
    });
}

export const updateComment = async(req, res) => {
    const { itemType, itemId, commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      item: itemId,
      itemType
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found for this item"
      });
    }

    if (!comment.user.equals(req.user._id)) {
      return res.status(403).json({
        message: "Not allowed to update this comment"
      });
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({
      message: "Comment updated successfully",
      comment
    });
}

export const deleteComment = async(req, res) => {
    const { itemType, itemId, commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      item: itemId,
      itemType
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found for this item"
      });
    }

    if (!comment.user.equals(req.user._id)) {
      return res.status(403).json({
        message: "Not allowed to delete this comment"
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      message: "Comment deleted successfully"
    });
}