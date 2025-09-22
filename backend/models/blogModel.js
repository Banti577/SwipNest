const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const blogSchema = new Schema({
  title: { 
    type: String, 
    required: true
 },
  content: { 
    type: String, 
    required: true 
},
  createdBy: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true 
},

 coverImageUrl: {
    type: String,
    required: false
    },
}, { timestamps: true });

const Blog = model('Blog', blogSchema);

module.exports = Blog;
