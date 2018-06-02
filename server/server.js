require('./config/config');
const {mongoose} = require('./db/mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const TodoController = require('./controllers/todoController');
const UserController = require('./controllers/userController');

const app = express();
const port = process.env.PORT;

//todo: Solve problem with not JSON request
app.use(bodyParser.json());

// Todos routes
app.post('/todos', TodoController.createTodo);
app.get('/todos', TodoController.getAllTodos);
app.get('/todos/:id', TodoController.getTodo);
app.delete('/todos/:id', TodoController.deleteTodo);
app.patch('/todos/:id', TodoController.updateTodo);

// Users routes
app.post('/users', UserController.createUser);

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};