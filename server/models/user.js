const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// User
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    }
});

const User = mongoose.model('User', userSchema);

module.exports = {User};