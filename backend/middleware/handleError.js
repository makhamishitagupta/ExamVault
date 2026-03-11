import multer from "multer";
// Error handling middleware for multer upload
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: `File upload error: ${err.message}`
    });
  } else if (err) {
    console.error('Upload middleware error:', err);
    return res.status(500).json({
      message: `Upload error: ${err.message}`
    });
  }
  next();
};