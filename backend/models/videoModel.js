const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const videoSchema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  duration: {
      type: Number, 
      default: 0,
    },
    type: {
      type: String,
      enum: ["long", "short"], 
      default: "long",
    },
     uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
       likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      default: "General",
    },

  },
  { timestamps: true }
);

const Video = model('Video', videoSchema);
module.exports = Video;    
