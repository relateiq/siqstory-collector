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

var sequelize = new Sequelize("postgres://scamden:E6Cb.M4QBWW*LT@siqstorydb.cuwyz56hhvzk.us-east-1.rds.amazonaws.com:5432");

module.exports.hello = (event, context, callback) => {
  let result;
  sequelize
    .authenticate()
    .then(function (err) {
      result = 'Connection has been established successfully.';
    })
    .catch(function (err) {
      result = 'Unable to connect to the database:';
    });
  const response = {
    statusCode: 200,
    body: result,
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
