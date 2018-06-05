const {User} = require('../models/user');
const {ObjectID} = require('mongodb');
const help = require('../helpers/helpers');
const hash = require('../helpers/Hash');

class UserController {

    static async createUser(req, res) {
        try {
            const body = help.pick(req.body, ['email', 'password']);
            const user = await new User(body).save();
            const token = await user.generateAuthToken();
            return res.header('x-auth', token).send(user);
        } catch (e) {
            res.status(400).send({status: 'ERROR', error: e});
        }
    }
    
    static async getUser(req, res) {
        res.send(req.user);
    }

    static async authenticate(req, res, next) {
        try {
            const token = req.header('x-auth');
            const user = await User.findByToken(token);
            if (!user) return res.status(401).send();
            req.user = user;
            req.token = token;
            next();
        } catch (e) {
            res.status(401).send();
        }
    }

    static async login(req, res) {
        const body = help.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        if (user) {
            const token = await user.generateAuthToken();
            return res.header('x-auth', token).send(user);
        }
        return res.status(400).send();
    }
}

module.exports = UserController;