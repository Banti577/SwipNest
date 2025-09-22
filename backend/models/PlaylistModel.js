const mongoose = require("mongoose");  // CommonJS
const { Schema, model } = mongoose;

const playlistSchema = new Schema({
  name: { type: String, required: true },
  videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model("Playlist", playlistSchema);
