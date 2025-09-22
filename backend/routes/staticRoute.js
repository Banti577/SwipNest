const express = require('express');
const router = express.Router();
const UserDB = require('../models/userModel');
const { handleUserSignUp, handleUserLogin } = require('../controller/userAuth');
const { createHmac, randomBytes } = require('crypto');
const { checkAuthenticationCookie } = require('../middleware/authentication');
const Video = require('../models/videoModel');
const Subscribe = require('../models/subScriberModel')
const Blog = require('../models/blogModel')
const Playlist = require('../models/PlaylistModel');


//Sign UP Route and Implementation
router.get('/signup', (req, res) => {
  return res.render('signup');
}).post('/signup', handleUserSignUp);

router.post('/verify-otp', async (req, res) => {
  const { otp } = req.body
  if (otp == req.session.otp) {
    req.session.emailVerified = true;

    const FullName = req.session.FullName;
    const password = req.session.password;
    const email = req.session.email;


    await UserDB.create({
      FullName,
      email,
      password
    });
    return res.status(200).json({ message: "OTP verified successfully" });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
})



router.get('/login', (req, res) => {
  return res.render('login');
}).post('/login', handleUserLogin);

router.get('/logout', (req, res) => {
  res.clearCookie('token');

  return res.status(200).json({ message: "suceess Logout" });
});

router.get("/me", checkAuthenticationCookie("token"), (req, res) => {
  if (!req.user) {

    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json({ user: req.user });
});

router.get('/my-profile', (req, res) => {
  res.render('myProfile');
})

// GET followers of logged-in user
router.get('/followers', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Login required" });

    const userId = req.user._id;

    // Jo log mujhe follow kar rahe hain

 const followers = await Subscribe.find({ 
      subscribedTo: userId, 
      subscriber: { $ne: userId } 
    })
      .sort({ subscribedAt: -1 })  // latest first
      .populate('subscriber', '_id FullName profilePicture');

    const formatted = followers.map(f => ({
      _id: f.subscriber._id,
      name: f.subscriber.FullName,
      profilePicture: f.subscriber.profilePicture,
      link: `/user/${f.subscriber._id}`,
      followedAt: f.subscribedAt
    }));

    res.status(200).json(formatted);

  } catch (err) {
    res.status(500).json({ message: "Error fetching followers", error: err.message });
  }
});


// GET following daitels
router.get('/following', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Login required" });

    const userId = req.user._id;

    // Jo log mujhe follow kar rahe hain
    const following = await Subscribe.find({ subscriber: userId,
      subscribedTo: { $ne: userId }
     })
      .populate('subscribedTo', '_id FullName profilePicture'); // follower info

    const formatted = following.map(f => ({
      _id: f.subscribedTo._id,
      name: f.subscribedTo.FullName,
      profilePicture: f.subscribedTo.profilePicture,
      link: `/user/${f.subscribedTo._id}`,
      followingAt: f.subscribedAt
    }));

    res.status(200).json(formatted);

  } catch (err) {
    res.status(500).json({ message: "Error fetching followers", error: err.message });
  }
});



router.post('/comment/:id/like', async (req, res) => {

  const commentID = req.params.id;
  const userId = req.user._id;
  const comment = await CommentDB.findById(commentID);

  if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

  const alreadyLiked = comment.likes.includes(userId);

  if (alreadyLiked) {
    // Unlike
    comment.likes.pull(userId);
    await comment.save();

    return res.json({
      success: true,
      liked: false,
      totalLikes: comment.likes.length

    });
  } else {
    // Like
    comment.likes.push(userId);
    await comment.save();

    return res.json({
      success: true,
      liked: true,
      totalLikes: comment.likes.length

    });

  }

})


router.post('/subscribe/:id', async (req, res) => {
  try {


    if (!req.user) return res.status(401).json({ message: "Login to Follow" });
    const userId = req.user._id;
    const videoID = req.params.id;
    const video = await Video.findById(videoID).populate("uploadedBy");


    if (!video) return res.status(404).json({ message: "Video not found" });
    const userToSubscribe = video.uploadedBy._id;

    console.log('hamaaara bhara1t12');
    const existingSub = await Subscribe.findOne({
      subscriber: userId,
      subscribedTo: userToSubscribe
    });


    if (existingSub) {

      // Unsubscribe
      await existingSub.deleteOne();
      const totalSubss = await Subscribe.countDocuments({ subscribedTo: userToSubscribe });
      return res.status(200).json({ message: "UnFollowed successfully", totalSubs: totalSubss });
    } else {
      // Subscribe
      await Subscribe.create({
        subscriber: userId,
        subscribedTo: userToSubscribe,
        sourceVideo: videoID
      });

      const totalSubs = await Subscribe.countDocuments({ subscribedTo: userToSubscribe });
      return res.status(200).json({ message: "Followed successfully", totalSubs });

    }
  } catch (err) {

  }
})

router.get('/countFollowers/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId).select("uploadedBy");
    const videoAdminID = video.uploadedBy;

    //userID exist For Follow Unfollow Toggle Buttton
    var isFollowed = false;
    if (req.user) {
      const userId = req.user._id;

      const existingSub = await Subscribe.findOne({
        subscriber: userId,
        subscribedTo: videoAdminID
      });
      if (existingSub) {
        var isFollowed = true;
      }

    }

    const count = await Subscribe.countDocuments({ subscribedTo: videoAdminID });
    return res.status(200).json({ count, isFollowed });
  } catch {

  }
})

router.get('/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    const user = await UserDB.findById(creatorId).select("FullName email profilePicture createdAt");
    if (!user) return res.status(404).json({ error: "User not found" });
    const videos = await Video.find({ uploadedBy: creatorId });

    const blogs = await Blog.find({ createdBy: creatorId });
    const playlist = await Playlist.find({ createdBy: creatorId }).populate({
      path: "videos", select: "title duration thumbnailUrl createdAt",
      populate: {
        path: "uploadedBy",
        select: "FullName profilePicture"  // sirf ye fields chahiye
      }
    });
    res.json({ user, videos, blogs, playlist });
  } catch (err) {
    res.status(500).json({ error: "Server error" });

  }


})




module.exports = router;