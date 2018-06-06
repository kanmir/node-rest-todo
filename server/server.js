require('./config/config');
const {mongoose} = require('./db/mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const TodoController = require('./controllers/todoController');
const UserController = require('./controllers/userController');

const {authenticate} = require('./middleware/authenticate');
const app = express();
const port = process.env.PORT;

//todo: Solve problem with not JSON request
app.use(bodyParser.json());

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