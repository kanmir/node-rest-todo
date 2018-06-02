const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;

const connectWithRetry = function () {
    return mongoose.connect(dbURI)
        .then(() => {
            console.log('Connected to database');
        })
        .catch((e) => {
            console.error('Failed to connect to mongo on startup - retrying in 5 sec');
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

module.exports = {mongoose};