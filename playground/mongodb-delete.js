const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }

  console.log('Connected to MongoDB server');

  // delete many
  // db.collection('Todos').deleteMany({ text: 'Eat launch' })
  //   .then(result => {
  //     console.log(result);
  //   });

  // delete one
  // db.collection('Todos').deleteOne({ text: 'Something todo' })
  //   .then(result => {
  //     console.log(result);
  //   });

  // findone & delete
  // db.collection('Todos').findOneAndDelete({ complete: false })
  //   .then(result => {
  //     console.log(result);
  //   });

  //db.close();
});
