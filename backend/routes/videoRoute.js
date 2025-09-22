const express = require("express");
const multer = require("multer");
const cloudinary = require("../cloudinary");

const { uploadVideo } = require("../controller/videoController");
const Video = require("../models/videoModel");
const View = require("../models/videoViewModel");
const videoComment = require('../models/videoCommentModel');
const VideoViewModel = require("../models/videoViewModel");


const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({ storage });


// route
router.post("/upload", upload.fields([{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), uploadVideo);
router.get("/all", async (req, res) => {
  try {
    const videos = await Video.aggregate([
      {
        $lookup: {
          from: "views",              // View model ka collection name
          localField: "_id",          // Video._id
          foreignField: "video",    // View.videoId
          as: "viewsData"
        }
      },
      {
        $addFields: {
          viewsCount: { $size: "$viewsData" } // total views count
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "uploadedBy",
          foreignField: "_id",
          as: "uploadedBy"
        }
      },
      {
        $unwind: "$uploadedBy"
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          videoUrl: 1,
          category: 1,
          type: 1,
          thumbnailUrl: 1,
          duration: 1,
          createdAt: 1,
          viewsCount: 1,
          "uploadedBy._id": 1,
          "uploadedBy.FullName": 1,
          "uploadedBy.profilePicture": 1,
        }
      }, {
        $sort: { createdAt: -1 }
      }
    ]);
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching videos", error: err.message });
  }
});


//REleted Video SHow 

// routes/videoRoutes.js
router.get("/:id/related", async (req, res) => {
  try {

    const videoId = req.params.id;
    // Pehle current video nikaalo
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Related videos find karo (same category, but not the same video)
    const relatedVideos = await Video.find({
      category: video.category,
      _id: { $ne: videoId }
    })
      .limit(5) // sirf 5 videos dikhana
      .select("title thumbnailUrl videoUrl duration uploadedBy createdAt")
      .populate("uploadedBy", "FullName profilePicture");

    res.json(relatedVideos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//category fetch

router.get('/categories', async (req, res) => {
  try {
    const categories = await Video.distinct("category");
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: 'server error' });
  }
});

//comment route
router.post('/comment/:id', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Login to comment" });
    const videoId = req.params.id;
    const { comment } = req.body;
    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const newComment = await videoComment.create({
      videoID: videoId,
      comment,
      commentBy: req.user._id
    });
    await newComment.populate('commentBy', 'FullName profilePicture');
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: "Error commenting on video", error: err.message });
  }
})

//fetch all comments for a video
router.get('/Allcomments/:id', async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const videoId = req.params.id;
    let comments = await videoComment.find({ videoID: videoId }).populate('commentBy', '_id FullName profilePicture').sort({ createdAt: -1 });

    if (userId) {
      comments = comments.sort((a, b) => {
        if (a.commentBy._id.toString() === userId.toString()) return -1;
        if (b.commentBy._id.toString() === userId.toString()) return 1;
        return 0;
      });
    }
    res.status(200).json({ comments });
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments", error: err.message });
  }
});



router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("uploadedBy", "FullName profilePicture");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(video);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching video",
      error: err.message,
    });
  }
});

router.post("/views/:id", async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user ? req.user._id : null;

    let query = { video: videoId };


    if (userId) {
      query.user = userId;

    } else {
      const ip = req.ip;   // guest → unique per IP
      query.ipAddress = ip;
    }

    const existingView = await View.findOne(query);
    if (existingView) {
      return res.status(200).json({ message: "View already recorded" });
    }
    const newView = new View({
      video: videoId,
      user: userId,
      ipAddress: userId ? null : req.ip,
    });
    await newView.save();
    res.status(201).json(newView);
  } catch (err) {
    res.status(500).json({ message: "Error recording view", error: err.message });
  }
});

router.get("/views/count/:id", async (req, res) => {
  try {
    const videoId = req.params.id;
    const viewCount = await View.countDocuments({ video: videoId });
    res.status(200).json({ views: viewCount });
  } catch (err) {
    res.status(500).json({ message: "Error fetching view count", error: err.message });
  }
});

router.post('/like/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;

    if (!userId) return res.status(401).json({ message: "Login to like the video" });
    const video = await Video.findById(videoId);

    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.likes.includes(userId)) {
      video.likes.pull(userId);
      video.dislikes.pull(userId);
    } else {
      video.likes.push(userId);
      video.dislikes.pull(userId); // Remove dislike if exists
    }
    await video.save();
    res.status(200).json({ likes: video.likes.length, dislikes: video.dislikes.length });

  } catch (err) {
    res.status(500).json({ message: "Error liking video", error: err.message });
  }
})

router.post('/dislike/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;
    if (!userId) return res.status(401).json({ message: "Login to dislike the video" });
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });
    if (video.dislikes.includes(userId)) {
      video.dislikes.pull(userId);
      video.likes.pull(userId);
    } else {
      video.dislikes.push(userId);
      video.likes.pull(userId);
    }
    await video.save();
    res.status(200).json({ dislikes: video.dislikes.length, likes: video.likes.length });

  } catch (err) {
    res.status(500).json({ message: "Error disliking video", error: err.message });
  }
});

router.get('/videoSearch', (req, res) => {


  return res.json({ msg: 'baap re' });
})

router.delete('/deleteComment/:commentId', async (req, res) => {
  try {
    const commentId = req.params.commentId;
    if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }
    const result = await videoComment.deleteOne({ _id: commentId })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({ message: "Comment deleted successfully", commentId });
  } catch (err) {
    console.error("Error deleting comment:", err.message);
    res.status(500).json({ message: "Server error while deleting comment", error: err.message });
  }

});


router.put('/editVideo/:videoId', upload.single("thumbnail"), async (req, res) => {
  try {
    const videoID = req.params.videoId;
    const userID = req.user?._id;
    if (!userID) return res.status(401).json({ message: "Login required" });

    const video = await Video.findById(videoID);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Authorization: only uploader can edit
    if (video.uploadedBy.toString() !== userID.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this video" });
    }

    // Update basic fields
    if (req.body.title) video.title = req.body.title;
    if (req.body.description) video.description = req.body.description;
    if (req.body.category) video.category = req.body.category;

    // Update thumbnail if provided
    if (req.file) {
      // Delete old thumbnail from Cloudinary if public_id exists
      if (video.thumbnailPublicId) {
        await cloudinary.uploader.destroy(video.thumbnailPublicId);
      }

      // Upload new thumbnail using buffer
      const thumbResult = await uploadFileToCloudinary(req.file.buffer, { folder: "thumbnails" });

      video.thumbnailUrl = thumbResult.secure_url;
      video.thumbnailPublicId = thumbResult.public_id; // store public_id for future deletion
    }

    const updatedVideo = await video.save();
    await updatedVideo.populate("uploadedBy", "FullName profilePicture");

    res.status(200).json({ message: "Thumbnail updated successfully", video: updatedVideo });
  } catch (err) {
    console.error("Error updating thumbnail:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


//Delete A Video

router.delete('/deleteVideo/:videoId', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Login to Delete Video" });

    const userID = req.user._id;
    const VideoID = req.params.videoId;


    const video = await Video.findById(VideoID);

    if (userID.toString() !== video.uploadedBy.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this video" });
    }

      // Extract public_id from video URL
    const videoPublicId = video.videoUrl.split('/upload/')[1].split('.')[0];

    await Video.findByIdAndDelete(VideoID);
    await cloudinary.uploader.destroy(videoPublicId, { resource_type: "video" });
    res.status(200).json({ message: "Video deleted successfully" });


  } catch (err) {
    res.status(500).json({ message: "Server error while deleting video", error: err.message });
  }
})

router.get('/watched/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!req.user) return res.status(401).json({ message: "Login to watch history" });
    const watchedViews = await VideoViewModel.find({ user: userId }).sort({ createdAt: -1 }).populate({
        path: "video",
        populate: { path: "uploadedBy", select: "FullName profilePicture" }
      });;


    const videoIds = watchedViews.map((v) => v.video);

    // Video details fetch karo
    const videos = await Video.find({ _id: { $in: videoIds } })
      .populate("uploadedBy", "FullName profilePicture") // uploader info
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json(videos);

  } catch(err) {
     console.error(err);
    res.status(500).json({ message: "Error fetching watched videos", error: err.message });

  }
})





module.exports = router;
