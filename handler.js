'use strict';

// var sequelize = new require('sequelize')('database', 'username', 'password', {
//   host: 'localhost',
//   dialect: 'postgres',

//   pool: {
//     max: 5,
//     min: 0,
//     idle: 10000
//   },

// });
console.log('require sequelize');
var Sequelize = require('sequelize');
// postgres: //[db_username]:[db_password]@[hostname]:[port]/[db_name]
console.log('create sequelize instance');
var sequelize = new Sequelize("postgres://scamden:E6Cb.M4QBWW*LT@siqstorydb-2.cuwyz56hhvzk.us-east-1.rds.amazonaws.com:5432/siqstorydb");
// console.log(sequelize);


module.exports.hello = (event, context, callback) => {
  let result = 'default result';
  // console.log('sequelize define');
  // var User = sequelize.define('user', {
  //   firstName: {
  //     type: Sequelize.STRING
  //   },
  //   lastName: {
  //     type: Sequelize.STRING
  //   }
  // });

  // // force: true will drop the table if it already exists
  // User.sync({
  //   force: true
  // }).then(function () {
  //   // Table created
  //   return User.create({
  //     firstName: 'John',
  //     lastName: 'Hancock'
  //   }).then(function () {
  //     User.findAll().then(function (users) {
  //       callback(null, users);
  //     })
  //   });
  // });

  sequelize
    .authenticate()
    .then(function (err) {
      result = 'Connection has been established successfully.';
    })
    .catch(function (err) {
      result = 'Unable to connect to the database:';
    }).finally(function () {
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: result,
          input: event,
        }),
      };

      callback(null, response);
    });


  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

// module.exports.hello(null, null, function (c, r) {
//   console.log('callback', r)
// });
