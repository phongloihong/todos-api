const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// const data = {
//   id: 10,
// };

// const token = jwt.sign(data, 'secret');
// console.log(token);

// const decode = jwt.verify(token, 'secret');
// console.log(decode);

const password = '123abc';
bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (error, hash) => {
    console.log(hash);
  });
});

const hashedPassword = '$2a$10$bzSwduvQrEwktBCt2TPJGeZMDXfRu40AQEbiDN2gHYAXf7NUShgXi';

bcrypt.compare(password, hashedPassword, (err, res) => {
  console.log(res);
});
