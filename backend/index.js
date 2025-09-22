
require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const path = require('path');
const staticRouter = require('./routes/staticRoute');
const blogRouter = require('./routes/blogRoute');
const videoRouter = require('./routes/videoRoute');
const Blog = require('./models/blogModel');
const { connectToMongoDB } = require('./connection');
const cookieParser = require('cookie-parser');
const { checkAuthenticationCookie } = require('./middleware/authentication');
const session = require('express-session');
const cors = require("cors");
const Video = require("./models/videoModel");
const User = require("./models/userModel");
const Playlist = require('./models/PlaylistModel');
require('dotenv').config();
const playlistRouter  = require('./routes/playlistRoute');






//Middleware
app.use(cors({
  origin:"https://swipnest.vercel.app",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'aatena@biharmai',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // secure: true तभी जब HTTPS हो
}));
app.use(checkAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')));

app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


//Global Middleware to make user available in all views

app.use((req, res, next) => {
  // console.log("USER from cookie:", req.user);
  res.locals.user = req.user;
  next();
});


//Routes
app.use('/user', staticRouter);
app.use('/blog', blogRouter);
app.use('/video', videoRouter);
app.use('/playlist',playlistRouter)

app.get('/api', async (req, res) => {
  const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
  res.json(allBlogs);
});

app.get('/api/profile', async(req, res) =>{
   if (!req.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    const videos = await Video.find({ uploadedBy: userId }).populate("uploadedBy", "FullName profilePicture");;
    const blogs = await Blog.find({ createdBy: userId });
    const playlist = await Playlist.find({ createdBy: userId }).populate({path: "videos", select :"title duration thumbnailUrl createdAt",
      populate: { 
      path: "uploadedBy", 
      select: "FullName profilePicture"  // sirf ye fields chahiye
    }});

    //const playlists = await Playlist.find({ createdBy: userId }).populate("videos");

    res.json({ user, videos, blogs, playlist});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching profile data" });
  }
})

app.get('/videoSearch', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim() === "") {
      return res.json({ results: [] });
    }
    const results = await Video.find({title :{$regex :query, $options: "i"},}).select("title _id");
    return res.json({ results });
  } catch (err) {

  }
})


connectToMongoDB(process.env.MONGO_URL);
//'10.162.156.212',



app.listen(port, (req, res) => {
  console.log(`Server is running on http://localhost:${port}`);
})
