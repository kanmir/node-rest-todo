const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../models/todo');

const todos = [
    {
        text: "First test todo"
    },
    {
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