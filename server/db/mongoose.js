const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const dbURI = process.env.MONGODB_URI;
let reconnectDelay = 100;

const connectWithRetry = async function () {
    try {
        const connection = await mongoose.connect(dbURI);
        console.log('Connected to database');
        return connection;
    } catch (e) {
        console.error(`Failed to connect to mongo on startup - retrying in ${reconnectDelay} ms`);
        setTimeout(connectWithRetry, reconnectDelay);
        if (reconnectDelay < 3000) reconnectDelay += 100;
    }
};

connectWithRetry();

module.exports = {mongoose};