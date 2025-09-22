const jwt = require('jsonwebtoken');
const UserDB = require('../models/userModel');

const secret = process.env.JWT_SECRET;



function generateTokenForUser(user) {
    console.log('profile image is', user.profilePicture)
    const payload = {
        _id: user._id,
        FullName: user.FullName,
        profileImgUrl: user.profilePicture,
        role: user.role,
    };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    //console.log('Generated token:', token);
    return token;
}

function verifyToken(token) {
    try {
        const payload = jwt.verify(token, secret);
      
        return payload;
    } catch (error) {
       
        return null;
    }
}

module.exports = {
    generateTokenForUser,
    verifyToken,
};

