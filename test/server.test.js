const chai = require('chai');
const chaiHttp = require('chai-http');
const { ObjectID } = require('mongodb');

const { app } = require('../server/server');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

const expect = chai.expect;

chai.use(chaiHttp);

// seeding data
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test todo test';

    chai.request(app)
      .post('/todos')
      .send({ text })
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body.text).to.equal(text);
        Todo.find({ text })
          .then((todos) => {
            expect(todos.length).to.equal(1);
            expect(todos[0].text).to.equal(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    let text = '1';

    chai.request(app)
      .post('/todos')
      .send({ text })
      .end((err, res) => {
        expect(res).to.have.status(400);
        Todo.find()
          .then(todos => {
            expect(todos.length).to.equal(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('Should get all todos', (done) => {
    chai.request(app)
      .get('/todos')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.todos.length).to.equal(2);
        done();
      });
  });
});

describe('GET /todos/:id', () => {
  it('Should return todo doc', (done) => {
    chai.request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.todo.text).to.equal(todos[0].text);
        done();
      });
  });

  it('Should return 404 if todo not found', (done) => {
    chai.request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it('Should return 404 if unvalid id', (done) => {
    chai.request(app)
      .get('/todos/12')
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

describe('DELETE /todos/:id', () => {
  it('Should remove a todo', done => {
    let hexID = todos[0]._id.toHexString();
    chai.request(app)
      .delete(`/todos/${hexID}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body.todo._id).to.equal(hexID);
        Todo.findById(hexID)
          .then((todo) => {
            expect(todo).to.not.exits;
            done();
          })
          .catch(e => done(e));
      });
  });

  it('Should return 404 if not found', (done) => {
    chai.request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it('Should return 404 if id is Invalid', (done) => {
    chai.request(app)
      .delete('/todos/12')
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

describe('PATCH /todos/:id', () => {
  it('Should update todo', (done) => {
    let hexID = todos[0]._id.toHexString();
    let text = 'Hey yo this is mocha test';

    chai.request(app)
      .patch(`/todos/${hexID}`)
      .send({ completed: true, text: text })
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body.todo.completed).to.equal(true);
        expect(res.body.todo.text).to.equal(text);
        expect(res.body.todo.completedAt).not.to.be.NaN;
        return done();
      });
  });

  it('Should clear completedAt when todo is not completed', (done) => {
    let hexID = todos[0]._id.toHexString();
    let text = 'Hey yo this is mocha test!!!';

    chai.request(app)
      .patch(`/todos/${hexID}`)
      .send({ completed: false, text: text })
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body.todo.completed).to.equal(false);
        expect(res.body.todo.text).to.equal(text);
        expect(res.body.todo.completedAt).to.not.exits;
        return done();
      });
  });
});

describe('GET /user/me', () => {
  it('Should return user if authenticated', (done) => {
    chai.request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body._id).to.equal(users[0]._id.toHexString());
        expect(res.body.email).to.equal(users[0].email);
        done();
      });
  });

  it('Should return 401 if not authenticated', (done) => {
    chai.request(app)
      .get('/users/me')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe('POST /users', () => {
  it('Should create new User', (done) => {
    const email = 'phongtest@gmail.com';
    const password = 'phong123456';

    chai.request(app)
      .post('/users')
      .send({
        email: email,
        password: password,
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body._id).to.exist;
        expect(res.body.email).to.equal(email);

        User.findOne({ email })
          .then((user) => {
            expect(user).to.exist;
            expect(user.password).to.not.equal(password);
            done();
          });
      });
  });

  it('Should return validation errors if data invalid', (done) => {
    chai.request(app)
      .post('/users')
      .send({
        email: 1,
        password: 'asdasd',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('Should not create new user if email is exist', (done) => {
    chai.request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'asdasd',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});