import Announcement from "../models/announcement.model.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, important } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const announcement = await Announcement.create({
      title,
      content,
      important
    });

    res.status(201).json({
      message: "Announcement created successfully",
      announcement
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllAnnouncements = async (req, res) => {
  // Guard against cold-start: if DB isn't ready yet, tell client to retry
  const dbState = (await import('mongoose')).default.connection.readyState;
  if (dbState !== 1) {
    return res.status(503)
      .set('Retry-After', '5')
      .json({ message: "Database not ready yet, please retry in a few seconds." });
  }

  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await announcement.deleteOne();

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
