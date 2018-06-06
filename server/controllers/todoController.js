const {Todo} = require('../models/todo');
const {ObjectID} = require('mongodb');
const help = require('../helpers/helpers');

class TodoController {

    static async createTodo(req, res) {
        try {
            const todo = new Todo(
                {
                    text: req.body.text,
                    _creator: req.user._id
                }
            );
            const doc = await todo.save();
            return res.send({todo: doc})
        } catch (e) {
            return res.status(400).send({status: 'ERROR', error: e})
        }
    }

    static async getAllTodos(req, res) {
        try {
            const todos = await Todo.find({_creator: req.user._id});
            return res.send({todos, status: 'OK'});
        } catch (e) {
            return res.status(400).send({status: 'ERROR', error: e});
        }
    }

    static async getTodo(req, res) {
        try {
            const id = req.params.id;
            if (!ObjectID.isValid(id)) return res.status(404).send({status: 'ERROR', error: 'NOT FOUND'});
            const todo = await Todo.findOne({_id: id, _creator: req.user._id});
            if (!todo) return res.status(404).send({status: 'ERROR', error: 'NOT FOUND'});
            return res.send({todo});
        } catch (e) {
            return res.status(400).send({status: 'ERROR', error: e});
        }
    }

    static async deleteTodo(req, res) {
        try {
            const id = req.params.id;
            if (!ObjectID.isValid(id)) return res.status(404).send();
            const todo = await Todo.findOneAndRemove({_id: id, _creator: req.user._id});
            if (!todo) return res.status(404).send({status: 'ERROR', error: 'NOT FOUND'});
            return res.send({todo});
        } catch (e) {
            return res.status(400).send({status: 'ERROR', error: e});
        }
    }

    static async updateTodo(req, res) {
        try {
            const id = req.params.id;
            const body = help.pick(req.body, ['text', 'completed']);
            if (!ObjectID.isValid(id)) return res.status(404).send({status: 'ERROR', error: 'NOT FOUND'});
            if (body.completed === true) {
                body.completedAt = new Date().getTime();
            }
            else {
                body.completed = false;
                body.completedAt = null;
            }
            const todo = await Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true});
            if (!todo) return res.status(404).send({status: 'ERROR', error: 'NOT FOUND'});
            return res.send({todo})
        } catch (e) {
            return res.status(400).send({status: 'ERROR', error: e})
        }
    }
}

module.exports = TodoController;
