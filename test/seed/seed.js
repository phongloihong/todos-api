const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('../../server/models/todo');
const { User } = require('../../server/models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'phongloi33@gmail.com',
  password: 'phongloi',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString(),
  }],
}, {
  _id: userTwoId,
  email: 'phongloi12@gmail.com',
  password: 'phongloi2',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString(),
  }],
}];

const todos = [
  {
    _id: new ObjectID(),
    text: 'First something to do',
    _creator: userOneId,
  }, {
    _id: new ObjectID(),
    text: 'Second something to do',
    completed: true,
    completedAt: 123,
    _creator: userTwoId,
  },
];

const populateTodos = (done) => {
  Todo.remove({})
      .then(() => Todo.insertMany(todos))
      .then(() => done());
};

const populateUsers = (done) => {
  User.remove({})
    .then(() => {
      const userOne = new User(users[0]).save();
      const userTwo = new User(users[1]).save();

      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

module.exports = { todos, populateTodos, users, populateUsers };
