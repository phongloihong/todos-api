const chai = require('chai');
const chaiHttp = require('chai-http');
const { ObjectID } = require('mongodb');
const expect = chai.expect;

const { app } = require('../server/server');
const { Todo } = require('../server/models/todo');

chai.use(chaiHttp);

const todos = [
  {
    _id: new ObjectID(),
    text: 'First something to do',
  }, {
    _id: new ObjectID(),
    text: 'Second something to do',
    completed: true,
    completedAt: 123,
  },
];

beforeEach(done => {
  Todo.remove({})
    .then(() => Todo.insertMany(todos))
    .then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', done => {
    let text = 'Test todo test';

    chai.request(app)
      .post('/todos')
      .send({ text })
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body.text).to.equal(text);
        Todo.find({ text })
          .then(todos => {
            expect(todos.length).to.equal(1);
            expect(todos[0].text).to.equal(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not create todo with invalid body data', done => {
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
  it('Should get all todos', done => {
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
  it('Should return todo doc', done => {
    chai.request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.todo.text).to.equal(todos[0].text);
        done();
      });
  });

  it('Should return 404 if todo not found', done => {
    chai.request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it('Should return 404 if unvalid id', done => {
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
          .then(todo => {
            expect(todo).to.not.exits;
            done();
          })
          .catch(e => done(e));
      });
  });

  it('Should return 404 if not found', done => {
    chai.request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it('Should return 404 if id is Invalid', done => {
    chai.request(app)
      .delete('/todos/12')
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

describe('PATCH /todos/:id', () => {
  it('Should update todo', done => {
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
        done();
      });
  });

  it('Should clear completedAt when todo is not completed', done => {
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
        done();
      });
  });
});
