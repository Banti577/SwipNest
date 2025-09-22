const express = require('express');
const router = express.Router();
const multer = require('multer');
const Blog = require('../models/blogModel');
const cloudinary = require('../cloudinary');

// 1 Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 2 Cloudinary helper
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// 3 Add Blog
router.post('/', upload.single('coverImage'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const createdBy = req.user?._id;
    if (!createdBy) return res.status(401).json({ message: "Unauthorized" });

    let coverImageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'blogCovers');
      coverImageUrl = result.secure_url;
    }

    const blog = await Blog.create({
      title,
      content,
      createdBy,
      coverImageUrl,
    });

    return res.status(200).json({ BlogID: blog._id });
  } catch (err) {
    console.error("Error uploading blog:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 4️Get Blog page (for rendering frontend if needed)
router.get('/addBlog', async (req, res) => {
  return res.render('addBlog');
});

// 5️ Get single blog
router.get('/:id', async (req, res) => {
  try {
    const blogID = req.params.id;
    const blog = await Blog.findById(blogID);

    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    //const comments = await CommentDB.find({ blogId: blogID }).populate('CommentBy');

    return res.status(200).json({ blog });
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//  Add comment
router.post('/comment/:id', async (req, res) => {
  try {
    const blogId = req.params.id;
    const { comment } = req.body;
    const CommentBy = req.user?._id;
    if (!CommentBy) return res.status(401).json({ message: "Unauthorized" });

    await CommentDB.create({
      blogId,
      comment,
      CommentBy,
    });

    res.redirect(`/blog/${blogId}`);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
