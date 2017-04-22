const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: value => validator.isEmail(value),
      message: '{VALUE} is not a valid Email',
    },
  },
  password: {
    type: String,
    require: true,
    minlength: 6,
  },
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// su dung method <=> khai bao tren document(1 dong) <=> tuong tac tren 1 dong
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generatorAuthToken = function () {
  const access = 'auth';
  const token = jwt.sign({ _id: this._id.toHexString(), access }, 'secret123').toString();

  this.tokens.push({ access, token });

  return this.save().then(() => token); // return promise will get promise when call
};

// su dung static <=> khai bao tren toan bo model <=> tuong tac tren toan bo model
UserSchema.statics.findByToken = function (token) {
  let decoded;

  try {
    decoded = jwt.verify(token, 'secret123');
  } catch (e) {
    return Promise.reject();
  }

  return this.findOne({
    _id: decoded._id,
    'tokens.access': 'auth',
    'tokens.token': token,
  });
};

UserSchema.statics.findByCredentials = function (email, password) {

  return this.findOne({ email }).then((user) => {
    if (!user) { 
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      
      // compare password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

// middleware
UserSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(this.password, salt, (error, hash) => {
        this.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('Users', UserSchema);

module.exports = { User };
