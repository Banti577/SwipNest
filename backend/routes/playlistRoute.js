const express = require('express');
const router = express.Router();
const UserDB = require('../models/userModel');
const Playlist = require('../models/PlaylistModel');

router.post('/add', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'Login first to create PLayList' })
        const playlistName = req.body.playlistName;
        const videoId = req.body.videoId;

        if (!playlistName || !videoId) {
            return res.status(400).json({ msg: 'Playlist name and videoId required' });
        }
        const userID = req.user._id;

        let playlist = await Playlist.findOne({ name: playlistName, createdBy: userID });

        if (playlist) {
            // Agar exist karti hai aur video pehle se nahi hai
            if (!playlist.videos.includes(videoId)) {
                playlist.videos.push(videoId);
                await playlist.save();
            }
        } else {
            // Nayi playlist create karo
            playlist = new Playlist({
                name: playlistName,
                videos: [videoId],
                createdBy: userID
            });
            await playlist.save();
        }
        res.json({ msg: 'Video saved to playlist successfully!', playlist });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal Server Error' });
    }

})

router.get("/myplaylist", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ msg: "Login first" });

    const playlists = await Playlist.find({ createdBy: req.user._id });
    res.json(playlists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;