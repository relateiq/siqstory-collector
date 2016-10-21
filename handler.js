'use strict';

var Sequelize = require('sequelize');
var request = require('request');
var sequelize = new Sequelize("postgres://scamden:E6Cb.M4QBWW*LT@siqstorydb-2.cuwyz56hhvzk.us-east-1.rds.amazonaws.com:5432/siqstorydb");

module.exports.getLastStory = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var SiqStory = sequelize.define('siq_story', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    timestamp: {
      type: Sequelize.BIGINT
    },
    twists: {
      type: Sequelize.JSON
    }
  });
  SiqStory.sync({}).then(function () {
    // Table created
    SiqStory.findOne({
      order: ['timestamp']
    }).then(function (lastStory) {
      lastStory = lastStory.get();
      console.log('lastStory', lastStory);
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(lastStory),
      };
      callback(null, response);
    });
  });
};

module.exports.saveStory = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var SiqStory = sequelize.define('siq_story', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    timestamp: {
      type: Sequelize.BIGINT
    },
    twists: {
      type: Sequelize.JSON
    }
  });
  var story = JSON.parse(event.body);
  // story.twists.forEach(function (twist) {
  //   if (twist.addedNodes && twist.addedNodes.length) {
  //     twist.addedNodes.forEach(function (addedNode) {
  //       if (addedNode.tagName = 'LINK') {
  //         if (addedNode.attributes && addedNode.attributes['rel'] && addedNode.attributes['rel'].toLowerCase() === 'stylesheet') {
  //           var href = addedNode.attributes['href'];
  //         }
  //       }
  //     });
  //   }
  // });
  SiqStory.sync({
    force: true
  }).then(function () {
    // Table created
    return SiqStory.create({
      id: story.id,
      timestamp: story.timestamp,
      twists: JSON.stringify(story.twists)
    }).then(function () {
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: '{"response" : "success"}',
      };
      callback(null, response);
    });
  });
};

function readCss(href) {

}
readCss();

module.exports.hello = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

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
};
