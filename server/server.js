require('./config/config');
const {mongoose} = require('./db/mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const TodoController = require('./controllers/todoController');
const UserController = require('./controllers/userController');

const {authenticate} = require('./middleware/authenticate');
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.use((error, req, res, next) => {
    if (error) {
        res.status(400).send({status: 'ERROR', message: 'Invalid request'})
    } else {
        next();
    }
});

// Todos routes
app.post('/todos', authenticate, TodoController.createTodo);
app.get('/todos', authenticate, TodoController.getAllTodos);
app.get('/todos/:id', authenticate, TodoController.getTodo);
app.delete('/todos/:id', authenticate, TodoController.deleteTodo);
app.patch('/todos/:id', authenticate, TodoController.updateTodo);

// Users routes
app.post('/users', UserController.createUser);
app.post('/users/login', UserController.login);
app.get('/users/me', authenticate, UserController.getUser);
app.delete('/users/me/token', authenticate, UserController.logout);

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};