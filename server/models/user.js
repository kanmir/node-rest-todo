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

userSchema.pre('save', function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.salt = hash.genRandomString(16);
        user.password = hash.hashData(user.password, user.salt);
    }
    next();
});

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    return help.pick(userObject, ['_id', 'email']);
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const access = 'auth';
    const token = jwt.sign(
        {
            _id: user._id.toHexString(),
            access
        },
        'abc123'
    );
    user.tokens = user.tokens.concat([{access, token}]);
    try {
        await user.save();
        return token;
    } catch (e) {
        return e;
    }
};

userSchema.statics.findByToken = async function (token) {
    const User = this;
    const user = await User.findOne(
        {
            'tokens.token': token,
            'tokens.access': 'auth'
        }
    );
    try {
        if (jwt.verify(token, 'abc123')) {
            return user;
        } else return null;
    } catch (e) {
        return null;
    }
};

userSchema.statics.findByCredentials = async function (email, password) {
    try {
        const User = this;
        const user = await User.findOne({email});
        if (hash.checkHash(password, user.salt, user.password)) {
            return user;
        }
        return null;
    } catch (e) {
        return null;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = {User};