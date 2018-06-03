const {User} = require('../models/user');
const {ObjectID} = require('mongodb');
const help = require('../helpers/helpers');

class UserController {

    static async createUser(req, res) {
        try {
            const body = help.pick(req.body, ['email', 'password']);
            const user = await new User(body).save();
            const token = await user.generateAuthToken();
            return res.header('x-auth', token).send({user});
        } catch (e) {
            res.status(400).send({status: 'ERROR', error: e});
        }
    }

}

module.exports = UserController;