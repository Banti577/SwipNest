const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const subscriberSchema = new Schema({
    subscriber: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscribedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // the "channel" user
    subscribedAt: { type: Date, default: Date.now },
    sourceVideo: { type: mongoose.Schema.Types.ObjectId, ref: "Video" } // optional
});

module.exports = model('Subscribe', subscriberSchema);
