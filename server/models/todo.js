let mongoose = require('mongoose');

let Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 2,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  conpletedAt: {
    type: Number,
    default: null,
  },
});

module.exports = { Todo };
