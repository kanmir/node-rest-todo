require('./config/config');
const {mongoose} = require('./db/mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const help = require('./helpers/helpers');

const app = express();

const port = process.env.PORT || 3000;


//todo: Solve problem with not JSON request
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    const todo = new Todo({
        text: req.body.text
    });

    todo.save()
        .then(doc => res.send(doc))
        .catch(e => res.status(400).send(e));
});

app.get('/todos', (req, res) => {
    Todo.find({})
        .then((todos) => {
            res.send({
                todos,
                status: 'ok'
            });
        })
        .catch((e) => {
            res.status(400).send({
                status: 'error',
                error: e
            });
        })
});

app.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) return res.status(404).send();

    Todo.findById(id)
        .then(todo => {
            if (!todo) return res.status(404).send();
            return res.send({todo});
        })
        .catch(e => {
            res.status(400).send({
                status: 'error',
                error: e
            });
        });
});

app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) return res.status(404).send();

    Todo.findByIdAndRemove(id)
        .then((todo) => {
            if (!todo) return res.status(404).send();
            return res.send({todo});
        })
        .catch(e => {
            res.status(400).send({
                status: 'error',
                error: e
            });
        });
});

app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    const body = help.pick(req.body, ['text', 'completed']);
    if (!ObjectID.isValid(id)) return res.status(404).send();

    if (body.completed === true) {
        body.completedAt = new Date().getTime();
    }
    else {
        body.completed = false;
        body.completedAt = null;
    }


    Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
        .then(todo => {
            if (!todo) return res.status(404).send();
            res.send({todo})
        })
        .catch(e => res.status(400).send());

});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};