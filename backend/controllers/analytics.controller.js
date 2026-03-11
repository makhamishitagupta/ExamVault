import Paper from '../models/papers.model.js';
import Notes from '../models/notes.model.js';
import User from '../models/user.model.js';

export const getAnalytics = async (req, res) => {
  try {
    const [totalPapers, totalNotes, totalUsers, paperDownloads, noteDownloads] = await Promise.all([
      Paper.countDocuments({ isActive: true }),
      Notes.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Paper.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
      Notes.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
    ]);

    const totalDownloads = (paperDownloads[0]?.total ?? 0) + (noteDownloads[0]?.total ?? 0);

    res.status(200).json({
      totalPapers,
      totalNotes,
      totalDownloads,
      totalUsers,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
};
