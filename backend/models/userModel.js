const mongoose = require('mongoose');
const { route } = require('../routes/staticRoute');
const { Schema, model } = mongoose;
const { createHmac, randomBytes } = require('crypto');

const userSchema = new Schema({
    FullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: '/img/default.jpg' // Assuming a default profile picture
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }


}, { timestamps: true });

userSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    if (this.isModified('password')) {
        const salt = randomBytes(16).toString();
        const hashPassword = createHmac('sha256', salt)
            .update(user.password)
            .digest('hex');
            this.salt = salt;
        this.password = hashPassword;
        next();
    }});

const UserDB = model('User', userSchema);
module.exports = UserDB;

