const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const videoCommentSchema = new Schema({
    videoID:
    {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    }, 
    comment: {
        required: true,
        type: String,   
    },
    commentBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
             default: []
        }
    ],
    dislikes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }
    ],
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment", // agar nested comments allow karna ho
        default: []
      },
    ],
    edited: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = model('VideoComment', videoCommentSchema);