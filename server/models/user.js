const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('../helpers/Jwt');
const hash = require('../helpers/Hash');
const help = require('../helpers/helpers');

const emailRE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: (value) => {
                return emailRE.test(value);
            },
            message: '{VALUE} is not a valid email!'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    salt: {
        type: String,
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    return help.pick(userObject, ['_id', 'email']);
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const access = 'auth';
    const salt = hash.genRandomString(16);
    const token = jwt.sign(
        {
            _id: user._id.toHexString(),
            access
        },
        salt
    );
    user.tokens = user.tokens.concat([{access, token}]);
    user.salt = salt;

    try {
        await user.save();
        return token;
    } catch (e) {
        return e;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = {User};