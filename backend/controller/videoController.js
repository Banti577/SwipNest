const Video = require("../models/videoModel");
const ffmpeg = require("fluent-ffmpeg");
const ffprobeStatic = require("ffprobe-static");
const fs = require("fs");
const path = require("path");
const os = require("os");
const cloudinary = require("../cloudinary");

// Set ffprobe path
ffmpeg.setFfprobePath(ffprobeStatic.path);

// Helper function to upload buffer to Cloudinary safely
const uploadFileToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          console.log("Cloudinary upload success:", result.secure_url);
          resolve(result);
        }
      });
      stream.end(buffer);
    } catch (err) {
      console.error("Upload function error:", err);
      reject(err);
    }
  });
};

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, type, category } = req.body;

    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: "Video file is required" });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;
    const uploadedByUser = req.user?._id;

    if (!uploadedByUser) {
      return res.status(401).json({ message: "Unauthorized: Please login first" });
    }

    console.log("Video upload started for user:", uploadedByUser);

    // 1️⃣ Temporary file for ffmpeg duration
    const tempVideoPath = path.join(os.tmpdir(), `${Date.now()}-${videoFile.originalname}`);
    fs.writeFileSync(tempVideoPath, videoFile.buffer);
    console.log("Temporary file created at:", tempVideoPath);

    // 2️⃣ Get video duration
    ffmpeg.ffprobe(tempVideoPath, async (err, metadata) => {
      if (err) {
        fs.unlinkSync(tempVideoPath);
        console.error("FFprobe error:", err);
        return res.status(500).json({ message: "Error reading video metadata", error: err.message });
      }

      const duration = metadata.format.duration;
      console.log("Video duration (seconds):", duration);

      try {
        // 3️⃣ Upload video to Cloudinary
        const videoResult = await uploadFileToCloudinary(videoFile.buffer, { resource_type: "video", folder: "videos" });

        // 4️⃣ Upload thumbnail if exists
        let thumbnailUrl = null;
        if (thumbnailFile) {
          const thumbResult = await uploadFileToCloudinary(thumbnailFile.buffer, { folder: "thumbnails" });
          thumbnailUrl = thumbResult.secure_url;
        }

        // 5️⃣ Save video info to MongoDB
        const newVideo = new Video({
          title,
          description,
          videoUrl: videoResult.secure_url,
          thumbnailUrl,
          duration,
          type,
          uploadedBy: uploadedByUser,
          category,
        });

        const savedVideo = await newVideo.save();
        console.log("Video saved to MongoDB with ID:", savedVideo._id);

        // 6️⃣ Cleanup temporary file
        fs.unlinkSync(tempVideoPath);
        console.log("Temporary file deleted");

        res.status(201).json(savedVideo);
      } catch (uploadErr) {
        fs.unlinkSync(tempVideoPath);
        console.error("Error during Cloudinary upload or MongoDB save:", uploadErr);
        return res.status(500).json({ message: "Error uploading video", error: uploadErr.message });
      }
    });
  } catch (err) {
    console.error("Unexpected error in uploadVideo:", err);
    res.status(500).json({ message: "Error uploading video", error: err.message });
  }
};

module.exports = {
  uploadVideo,
  uploadFileToCloudinary, // <--- export it
};
