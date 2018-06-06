const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);


describe('POST /todos', () => {
    test('should create a new todo', async done => {
        try {
            const text = 'Test todo text';
            const response = await request(app).post('/todos')
                .set('x-auth', users[0].tokens[0].token)
                .send({text});
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
            const response = await request(app).post('/todos')
                .set('x-auth', users[0].tokens[0].token)
                .send({});
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
            const response = await request(app).get('/todos').set('x-auth', users[0].tokens[0].token);
            expect(response.statusCode).toBe(200);
            expect(response.body.todos.length).toBe(1);
            done();
        } catch (e) {
            done(e);
        }
    });
});

describe('GET /todos/:id', () => {
    test('should return doc', async done => {
        try {
            const response = await request(app).get(`/todos/${todos[0]._id.toHexString()}`).set('x-auth', users[0].tokens[0].token);
            expect(response.statusCode).toBe(200);
            expect(response.body.todo.text).toBe(todos[0].text);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should not return doc created by other user', async done => {
        try {
            const response = await request(app).get(`/todos/${todos[1]._id.toHexString()}`).set('x-auth', users[0].tokens[0].token);
            expect(response.statusCode).toBe(404);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should return 404 if todo not found', async done => {
        try {
            const hexId = new ObjectID().toHexString();
            const response = await request(app).get(`/todos/${hexId}`).set('x-auth', users[0].tokens[0].token);
            expect(response.statusCode).toBe(404);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should return 404 for non-object ids', async done => {
        try {
            const response = await request(app).get(`/todos/123`).set('x-auth', users[0].tokens[0].token);
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
            const response = await request(app).delete(`/todos/${hexId}`).set('x-auth', users[1].tokens[0].token);
            expect(response.statusCode).toBe(200);
            expect(response.body.todo._id).toBe(hexId);
            const todo = await Todo.findById(hexId);
            expect(todo).toBe(null);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should NOT remove a todo', async done => {
        try {
            const hexId = todos[0]._id.toHexString();
            const response = await request(app).delete(`/todos/${hexId}`).set('x-auth', users[1].tokens[0].token);
            expect(response.statusCode).toBe(404);
            const todo = await Todo.findById(hexId);
            expect(todo).toBeDefined();
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should return 404 if todo not found', async done => {
        try {
            const hexId = new ObjectID().toHexString();
            const response = await request(app).delete(`/todos/${hexId}`).set('x-auth', users[1].tokens[0].token);
            expect(response.statusCode).toBe(404);
            done();
        } catch (e) {
            done(e)
        }
    });

    test('should return 404 for invalid ObjectID', async done => {
        try {
            const response = await request(app).delete(`/todos/123`).set('x-auth', users[1].tokens[0].token);
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
            const response = await request(app).patch(`/todos/${hexId}`).set('x-auth', users[0].tokens[0].token).send({text, completed: true});
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

    test('should NOT update the todo created by other user', async done => {
        try {
            const hexId = todos[0]._id.toHexString();
            const text = 'Updated text';
            const response = await request(app).patch(`/todos/${hexId}`).set('x-auth', users[1].tokens[0].token).send({text, completed: true});
            const todo = response.body.todo;
            expect(response.statusCode).toBe(404);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should clear completedAt when todo is not completed', async done => {
        try {
            const hexId = todos[1]._id.toHexString();
            const text = 'Updated text2';
            const response = await request(app).patch(`/todos/${hexId}`).set('x-auth', users[1].tokens[0].token).send({text, completed: false});
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

describe('GET users/me', () => {
    test('should return user if authenticated', async done => {
        try {
            const response = await request(app).get('/users/me').set('x-auth', users[0].tokens[0].token);
            expect(response.statusCode).toBe(200);
            expect(response.body.user._id).toBe(users[0]._id.toHexString());
            expect(response.body.user.email).toBe(users[0].email);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should return 401 if NOT authenticated', async done => {
        try {
            const response = await request(app).get('/users/me');
            expect(response.statusCode).toBe(401);
            expect(response.body.user).toBeUndefined();
            done();
        } catch (e) {
            done(e);
        }
    });
});

describe('POST /users', () => {
    test('should create a user', async done => {
        try {
            const email = 'example@example.com';
            const password = '123mnb!';
            const response = await request(app).post('/users').send({email, password});
            expect(response.statusCode).toBe(200);
            expect(response.headers['x-auth']).toEqual(expect.anything());
            expect(response.body.user._id).toEqual(expect.anything());
            expect(response.body.user.email).toBe(email);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should return validation errors if request invalid', async done => {
        try {
            response = await request(app).post('/users').send({email: 'and', password: '123'});
            expect(response.statusCode).toBe(400);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should not create user if email in use', async done => {
        try {
            const password = '123123';
            const response = await request(app).post('/users').send({email: users[0].email, password});
            expect(response.statusCode).toBe(400);
            done();
        } catch (e) {
            done(e);
        }
    });
});

describe('POST /users/login', () => {
    test('should login user and return auth token', async done => {
        try {
            const response = await request(app).post('/users/login').send({
                email: users[1].email,
                password: users[1].password,
            });
            expect(response.statusCode).toBe(200);
            expect(response.headers['x-auth']).toBeDefined();
            const user = await User.findById(users[1]._id);
            expect(user.tokens[1]).toMatchObject({
                access: 'auth',
                token: response.headers['x-auth']
            });
            done();
        } catch (e) {
            done(e);
        }
    });

    test('should reject invalid login', async done => {
        try {
            const response = await request(app).post('/users/login').send({
                email: users[1].email,
                password: users[1].password + 1,
            });
            expect(response.statusCode).toBe(400);
            expect(response.headers['x-auth']).toBeUndefined();
            expect(response.body.user).toBeUndefined();
            done();
        } catch (e) {
            done(e);
        }
    });
});

describe('DELETE /users/me/token', () => {
    test('should remove auth token on logout', async done => {
        try {
            const response = await request(app).delete('/users/me/token').set('x-auth', users[0].tokens[0].token);
            expect(response.statusCode).toBe(200);
            expect(response.body.status).toBe('OK');
            const user = await User.findById(users[0]._id);
            expect(user.tokens.length).toBe(0);
            done();
        } catch (e) {
            done(e);
        }
    });
});