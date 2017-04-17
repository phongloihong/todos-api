const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }

  console.log('Connected to MongoDB server');

  // db.collection('Todos').insertOne({
  //   text: 'Something todo',
  //   completed: false,
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable insert todo', err);
  //   }
  //
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });

  // db.collection('Users').insertOne({
  //   name: 'Phong Loi Hong',
  //   age: 25,
  //   location: 'TP.HCM',
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert todo', err);
  //   }
  //
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });

  db.collection('Users').find({ name: 'Phong Loi Hong1' }).toArray()
    .then(docs => {
      console.log(JSON.stringify(docs, undefined, 2));
    })
    .catch(err => {
      console.log('Unable to fetch data', err);
    });

  db.close();
});
