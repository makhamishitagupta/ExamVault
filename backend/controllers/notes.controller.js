import Notes from "../models/notes.model.js";
import Subject from "../models/subject.model.js";
import cloudinary from "../config/cloudinary.js";

import mongoose from "mongoose";

export const allNotes = async (req, res) => {
  const notes = await Notes.find({ isActive: true })
    .populate("subject", "name code")
    .populate("uploadedBy", "username");

  res.status(200).json({
    status: "ok",
    notes
  });
};

export const createNotes = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File must be uploaded" });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      folder: "notes"
    });

    const pdfUrl = uploadResult.secure_url;

    const { title, unit, subject, year } = req.body;

    const notes = await Notes.create({
      title,
      unit,
      subject,
      year,
      pdfUrl,
      uploadedBy: req.user._id
    });

    res.status(201).json(notes);
  } catch (error) {
    console.error("Create notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const viewNotes = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid notes ID" });
  }

  const notes = await Notes.findOne({
    _id: id,
    isActive: true
  })
    .populate("subject", "name code")
    .populate("uploadedBy", "username");

  if (!notes) {
    return res.status(404).json({ message: "Notes not found" });
  }

  res.status(200).json(notes);
};

export const updateNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, unit, subject, year } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notes ID" });
    }

    const notes = await Notes.findById(id);
    if (!notes || !notes.isActive) {
      return res.status(404).json({ message: "Notes not found" });
    }

    // Ownership check
    if (!notes.uploadedBy || !notes.uploadedBy.equals(req.user._id)) {
      return res.status(403).json({
        message: "You cannot update these notes"
      });
    }

    // Subject update (optional)
    if (subject) {
      if (!mongoose.Types.ObjectId.isValid(subject)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }

      const subjectExists = await Subject.findOne({
        _id: subject,
        isActive: true
      });

      if (!subjectExists) {
        return res.status(400).json({ message: "Invalid or inactive subject" });
      }

      notes.subject = subject;
    }

    if (title !== undefined) notes.title = title.trim();
    if (unit !== undefined) notes.unit = unit;
    if (year !== undefined) notes.year = year;

    await notes.save();

    res.status(200).json({
      message: "Notes updated successfully",
      notes
    });

  } catch (error) {
    console.error("Update notes error:", error);
    res.status(500).json({
      message: "Server error while updating notes"
    });
  }
};

export const deleteNotes = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid notes ID" });
  }

  const notes = await Notes.findById(id);
  if (!notes) {
    return res.status(404).json({ message: "Notes not found" });
  }

  // Handle both ObjectId and populated ref
  const uploadedById = notes.uploadedBy?._id != null
    ? String(notes.uploadedBy._id)
    : notes.uploadedBy != null
      ? String(notes.uploadedBy)
      : null;
  const userId = req.user._id != null ? String(req.user._id) : null;
  if (!uploadedById || !userId || uploadedById !== userId) {
    return res.status(403).json({
      message: "You cannot delete these notes"
    });
  }

  if (!notes.isActive) {
    return res.status(400).json({ message: "Notes already deleted" });
  }

  notes.isActive = false;
  await notes.save();

  res.status(200).json({
    message: "Notes deleted successfully"
  });
};

export const downloadNotes = async (req, res) => {
  const { id } = req.params;

  const notes = await Notes.findOne({
    _id: id,
    isActive: true
  });

  if (!notes) {
    return res.status(404).json({ message: "Notes not found" });
  }

  notes.downloadCount += 1;
  await notes.save();

  res.status(200).json({
    pdfUrl: notes.pdfUrl
  });
};

export const previewNotes = async (req, res) => {
  const { id } = req.params;

  const notes = await Notes.findOne({
    _id: id,
    isActive: true
  });  
  
  if (!notes) {
    return res.status(404).send("Notes not found");
  }

  return res.redirect(notes.pdfUrl);
};

export const toggleLikeNotes = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notes = await Notes.findById(id);
  if (!notes || !notes.isActive) {
    return res.status(404).json({ message: "Notes not found" });
  }

  const alreadyLiked = notes.likes.includes(userId);

  if (alreadyLiked) {
    await Notes.findByIdAndUpdate(id, {
      $pull: { likes: userId }
    });
  } else {
    await Notes.findByIdAndUpdate(id, {
      $addToSet: { likes: userId }
    });
  }

  const updatedNotes = await Notes.findById(id);

  res.status(200).json({
    liked: !alreadyLiked,
    likesCount: updatedNotes.likes.length
  });
};
