const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const { app } = require('../server/server');
const { Todo } = require('../server/models/todo');

chai.use(chaiHttp);

beforeEach(done => {
  Todo.remove({}).then(() => done());
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
        Todo.find()
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
            expect(todos.length).to.equal(0);
            done();
          })
          .catch(e => done(e));
      });
  });
});
