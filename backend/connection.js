const mongoose = require('mongoose');
function connectToMongoDB(URL) {

    mongoose.connect(URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

module.exports = {
    connectToMongoDB
};