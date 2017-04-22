require('./config/config');
require('./db/mongoose');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const { authenticate } = require('../server/middleware/authenticate');

const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text,
  });
  todo.save().then(result => res.send(result), e => res.status(400).send(e));
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({ todos });
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;

  // Valid id using isValid
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  return Todo.findById(id)
    .then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }

      return res.send({ todo });
    })
    .catch(e => res.status(400).send(e));
});

app.delete('/todos/:id', (req, res) => {
  // get the id
  const id = req.params.id;

  // validate id -> not valid ? return 404
  if (!ObjectID.isValid(id)) return res.status(404).send();

  // remove by id
  return Todo.findByIdAndRemove(id)
    .then((todo) => {
      if (!todo) return res.status(404).send();

      return res.send({ todo });
    })
    .catch(e => res.staus(400).send(e));
});

app.patch('/todos/:id', (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then((todo) => {
      if (!todo) return res.status(404).send();

      return res.send({ todo });
    })
    .catch(e => res.status(400).send(e));
});

// ------- USERS
app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);

  user.save()
    .then(() => user.generatorAuthToken())
    .then(token => res.header('x-auth', token).send(user))
    .catch(e => res.status(400).send(e));
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then((user) => {
      user.generatorAuthToken().then((token) => {
        res.header('x-auth', token).send(user);
      });
    })
    .catch(e => res.status(400).send());
});

app.listen(process.env.PORT || 3000, () => console.log('Server is up'));

module.exports = { app };
