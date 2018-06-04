const {ObjectID} = require('mongodb');
const {Todo} = require('../../models/todo');
const {User} = require('../../models/user');
const jwt = require('../../helpers/Jwt');
const hash = require('../../helpers/Hash');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
    {
        _id: userOneId,
        email: 'dmitriy@example.com',
        password: 'dmitriyPass',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({_id: userOneId.toHexString(), access: 'auth'}, 'abc123')
            }
        ]
    },
    {
        _id: userTwoId,
        email: 'ivan@example.com',
        password: 'ivanPass',
    }
];

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

const populateTodos = async done => {
    try {
        await Todo.remove({});
        await Todo.insertMany(todos);
        done();
    } catch (e) {
        done(e);
    }
};

const populateUsers = async done => {
    try {
        await User.remove({});
        const userOne = new User(users[0]).save();
        const userTwo = new User(users[1]).save();
        await userOne;
        await userTwo;
        done();
    } catch (e) {
        done(e);
    }
};

module.exports = {todos, populateTodos, users, populateUsers};