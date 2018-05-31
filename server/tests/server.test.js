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
        text: "Second test todo"
    }
];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    test('should create a new todo', (done) => {
        const text = 'Test todo text';
        request(app)
            .post('/todos')
            .send({text})
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body.text).toBe(text);

                Todo.find({text})
                    .then((todos) => {
                        expect(todos.length).toBe(1);
                        done();
                    })
                    .catch((e) => done(e));
            });
    });

    test('should not create todo with invalid body data', done => {
        request(app)
            .post('/todos')
            .send({})
            .then(response => {
                expect(response.statusCode).toBe(400);
                Todo.find({})
                    .then((todos) => {
                        expect(todos.length).toBe(2);
                        done();
                    })
                    .catch((e) => done(e));

            });
    });
});


describe('GET /todos', () => {
    test('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body.todos.length).toBe(2);
                done();
            })
            .catch((e) => done(e));
    });
});

describe('GET /todos/:id', () => {
    test('should return doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body.todo.text).toBe(todos[0].text);
                done();
            })
            .catch(e => done(e));
    });

    test('should return 404 if todo not found', (done) => {
        const hexId = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexId}`)
            .then(response => {
                expect(response.statusCode).toBe(404);
                done();
            })
            .catch(e => done(e));
    });

    test('should return 404 for non-object ids', (done) => {
        request(app)
            .get(`/todos/123`)
            .then(response => {
                expect(response.statusCode).toBe(404);
                done();
            })
            .catch(e => done(e));
    });
});

describe('DELETE /todos/:id', () => {
    test('should remove a todo', (done) => {
        const hexId = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body.todo._id).toBe(hexId);
                Todo.findById(hexId)
                    .then(todo => {
                        expect(todo).toBe(null);
                        done();
                    }).catch(e => done(e));
            })
            .catch(e => done(e));
    });

    test('should return 404 if todo not found', (done) => {
        const hexId = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .then(response => {
                expect(response.statusCode).toBe(404);
                done();
            })
            .catch(e => done(e));
    });

    test('should return 404 for invalid ObjectID', (done) => {
        request(app)
            .delete(`/todos/123`)
            .then(response => {
                expect(response.statusCode).toBe(404);
                done();
            })
            .catch(e => done(e));
    });
});