const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const { app } = require('../server/server');
const { Todo } = require('../server/models/todo');

chai.use(chaiHttp);

const todos = [
  {
    text: 'First something to do',
  }, {
    text: 'Second something to do',
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
