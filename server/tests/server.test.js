const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');

const todos = [
    {
        _id: new ObjectID(),
        text: "First test todo"
    },
    {
        _id: new ObjectID(),
        text: "Second test todo",
        completed: true,
        completedAt: 333
    }
];

beforeEach(async done => {
    try {
        await Todo.remove({});
        await Todo.insertMany(todos);
        done();
    } catch (e) {
        done(e);
    }
});

describe('POST /todos', () => {
    test('should create a new todo', async done => {
        try {
            const text = 'Test todo text';
            const response = await request(app).post('/todos').send({text});
            expect(response.statusCode).toBe(200);
            expect(response.body.todo.text).toBe(text);
            const todos = await Todo.find({text});
            expect(todos.length).toBe(1);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should not create todo with invalid body data', async done => {
        try {
            const response = await request(app).post('/todos').send({});
            expect(response.statusCode).toBe(400);
            const todos = await Todo.find({});
            expect(todos.length).toBe(2);
            done();
        } catch (e) {
            done(e);
        }
    });
});


describe('GET /todos', () => {
    test('should get all todos', async done => {
        try {
            const response = await request(app).get('/todos');
            expect(response.statusCode).toBe(200);
            expect(response.body.todos.length).toBe(2);
            done();
        } catch (e) {
            done(e);
        }
    });
});

describe('GET /todos/:id', () => {
    test('should return doc', async done => {
        try {
            const response = await request(app).get(`/todos/${todos[0]._id.toHexString()}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.todo.text).toBe(todos[0].text);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should return 404 if todo not found', async done => {
        try {
            const hexId = new ObjectID().toHexString();
            const response = await request(app).get(`/todos/${hexId}`);
            expect(response.statusCode).toBe(404);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should return 404 for non-object ids', async done => {
        try {
            const response = await request(app).get(`/todos/123`);
            expect(response.statusCode).toBe(404);
            done();
        } catch (e) {
            done(e);
        }
    });
});

describe('DELETE /todos/:id', () => {
    test('should remove a todo', async done => {
        try {
            const hexId = todos[1]._id.toHexString();
            const response = await request(app).delete(`/todos/${hexId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.todo._id).toBe(hexId);
            const todo = await Todo.findById(hexId);
            expect(todo).toBe(null);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should return 404 if todo not found', async done => {
        try {
            const hexId = new ObjectID().toHexString();
            const response = await request(app).delete(`/todos/${hexId}`);
            expect(response.statusCode).toBe(404);
            done();
        } catch (e) {
            done(e)
        }
    });

    test('should return 404 for invalid ObjectID', async done => {
        try {
            const response = await request(app).delete(`/todos/123`);
            expect(response.statusCode).toBe(404);
            done();
        } catch (e) {
            done(e);
        }
    });
});

describe('PATCH /todos/:id', () => {
    test('should update the todo', async done => {
        try {
            const hexId = todos[0]._id.toHexString();
            const text = 'Updated text';
            const response = await request(app).patch(`/todos/${hexId}`).send({text, completed: true});
            const todo = response.body.todo;
            expect(response.statusCode).toBe(200);
            expect(todo.completed).toBe(true);
            expect(todo.text).toBe(text);
            expect(typeof todo.completedAt).toBe('number');
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should clear completedAt when todo is not completed', async done => {
        try {
            const hexId = todos[1]._id.toHexString();
            const text = 'Updated text2';
            const response = await request(app).patch(`/todos/${hexId}`).send({text, completed: false});
            const todo = response.body.todo;
            expect(response.statusCode).toBe(200);
            expect(todo.completed).toBe(false);
            expect(todo.text).toBe(text);
            expect(todo.completedAt).toBeNull();
            done();
        } catch (e) {
            done(e);
        }
    });
});