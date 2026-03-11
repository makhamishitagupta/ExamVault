import Paper from "../models/papers.model.js";
import Subject from "../models/subject.model.js";
import axios from "axios";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

const isDbReady = () => Paper.db?.readyState === 1;

export const allPapers = async (req, res) => {
  if (!isDbReady()) {
    return res.status(503).set('Retry-After', '5').json({ status: "error", message: "Server warming up, please retry." });
  }
  try {
    const papers = await Paper.find({ isActive: true })
      .populate("subject", "name code")
      .populate("uploadedBy", "username");
    res.status(200).json({ status: "ok", papers });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

export const createPaper = async (req, res) => {
  try {
    // console.log('CreatePaper called');
    // console.log('req.file:', req.file ? `Present (${req.file.size} bytes)` : 'Missing');
    // console.log('req.body:', req.body);
    // console.log('req.user:', req.user?._id);

    // Check if file is uploaded
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({
        message: "File must be uploaded"
      });
    }

    const pdfUrl = req.file.path;
    const { title, subject, examType, year } = req.body;

    // Validate required fields
    if (!title || !subject || !examType) {
      console.error('❌ Missing required fields:', { title, subject, examType });
      return res.status(400).json({
        message: "All required fields must be provided (title, subject, examType)"
      });
    }

    // Validate subject exists and is active
    const subjectExists = await Subject.findOne({
      _id: subject,
      isActive: true
    });

    if (!subjectExists) {
      console.error('❌ Invalid subject:', subject);
      return res.status(400).json({
        message: "Invalid or inactive subject"
      });
    }

    // Validate examType
    const validExamTypes = ['Mid1', 'Mid2', 'Sem', 'Other'];
    if (!validExamTypes.includes(examType)) {
      console.error('❌ Invalid examType:', examType);
      return res.status(400).json({
        message: `Invalid examType. Must be one of: ${validExamTypes.join(', ')}`
      });
    }

    // Create paper
    const paper = await Paper.create({
      title,
      subject,
      examType,
      pdfUrl,
      uploadedBy: req.user._id,
      year: year ? parseInt(year) : undefined
    });

    console.log('✅ Paper created successfully:', paper._id);

    res.status(201).json({
      message: "Paper created successfully",
      paper
    });

  } catch (error) {
    console.error('❌ Create paper error:', error);
    res.status(500).json({
      message: "Server error while creating paper",
      error: error.message
    });
  }
}

export const deletePaper = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid paper ID" });
  }

  const paper = await Paper.findById(id);

  const userId = req.user._id;

  if (!paper) {
    return res.status(404).json({ message: "Paper not found" });
  }

  if (paper.uploadedBy.toString() !== userId.toString()) {
    return res.status(400).json({ message: "You cannot delete the paper as you have not created the paper" });
  }

  if (!paper.isActive) {
    return res.status(400).json({
      message: "Paper already deleted"
    });
  }

  paper.isActive = false;
  await paper.save();

  res.status(200).json({
    message: "Paper deleted successfully"
  });
}

export const viewPapers = async (req, res) => {
  const { id } = req.params;

  const paper = await Paper.findOne({
    _id: id,
    isActive: true
  })
    .populate("subject", "name code")
    .populate("uploadedBy", "username");

  if (!paper) {
    return res.status(404).json({ message: "Paper not found" });
  }

  res.status(200).json(paper);
}

export const downloadPaper = async (req, res) => {
  const { id } = req.params;

  const paper = await Paper.findOne({
    _id: id,
    isActive: true
  });

  if (!paper) {
    return res.status(404).json({ message: "Paper not found" });
  }

  paper.downloadCount += 1;
  await paper.save();

  // res.download(filePath)

  res.status(200).json({
    pdfUrl: paper.pdfUrl
  });
}

export const previewPaper = async (req, res) => {
  const { id } = req.params;

  const paper = await Paper.findOne({ _id: id, isActive: true });
  if (!paper) {
    return res.status(404).send("Paper not found");
  }

  return res.redirect(paper.pdfUrl);
};


export const updatePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, examType, year } = req.body;

    // Validate paper ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid paper ID" });
    }

    // Find paper
    const paper = await Paper.findById(id);
    if (!paper || !paper.isActive) {
      return res.status(404).json({ message: "Paper not found" });
    }

    // Ownership check (SAFE)
    if (!paper.uploadedBy) {
      return res.status(400).json({
        message: "Paper owner missing due to old data. Please recreate the paper."
      });
    }

    if (!paper.uploadedBy.equals(req.user._id)) {
      return res.status(403).json({
        message: "You cannot update this paper as you did not create it"
      });
    }

    // Subject update (if provided)
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

      paper.subject = subject;
    }

    // Partial updates
    if (title !== undefined) paper.title = title;
    if (examType !== undefined) paper.examType = examType;
    if (year !== undefined) {
      if (year === null || year === '') {
        paper.year = undefined; // Remove year if empty
      } else {
        paper.year = parseInt(year);
      }
    }

    await paper.save();

    res.status(200).json({
      message: "Paper updated successfully",
      paper
    });

  } catch (error) {
    console.error("Update paper error:", error);
    res.status(500).json({
      message: "Server error while updating paper"
    });
  }
};

export const toggleLikePaper = async (req, res) => {
  const { id } = req.params; // paper id
  const userId = req.user._id; // came from the middleware and it is user id

  const paper = await Paper.findById(id);
  if (!paper || !paper.isActive) {
    return res.status(404).json({ message: "Paper not found" });
  }

  const alreadyLiked = paper.likes.includes(userId); // checking for the user in the likes arraylist

  if (alreadyLiked) {
    await Paper.findByIdAndUpdate(id, {
      $pull: { likes: userId }
    });
  } else {
    await Paper.findByIdAndUpdate(id, {
      $addToSet: { likes: userId }
    });
  }

  const updatedPaper = await Paper.findById(id);

  res.status(200).json({
    liked: !alreadyLiked,
    likesCount: updatedPaper.likes.length
  });
}