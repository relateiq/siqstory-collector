'use strict';

var Sequelize = require('sequelize');
var request = require('request');
// NOTE: dbconfig is not checked in so you would need to provide
//  your own database link here by creating that file
var sequelize = new Sequelize(require('./dbconfig').dbLink);
var aws = require('aws-sdk');
var Promise = require('bluebird');
var md5 = require('js-md5');

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
  var twistPromises =
    Promise.all(story.twists.map(function (twist) {
      let twistPromise = Promise.resolve(twist);
      if (twist.addedNodes && twist.addedNodes.length) {
        var addedNodesPromise = Promise.all(twist.addedNodes.map(function (addedNode) {
          let addedNodePromise = Promise.resolve(addedNode);
          if (addedNode.tagName === 'LINK') {
            if (addedNode.attributes && addedNode.attributes['rel'] && addedNode.attributes['rel'].toLowerCase() === 'stylesheet') {
              var href = addedNode.attributes['href'];
              // just for local testing
              if (href.match(/((localhost)|(127\.0\.0\.1))\:[0-9]+/)) {
                // just to test it
                href = 'https://app.salesforceiq.com/public/css/riq.css?537d5ff02b95ba7bc8ccb525681f5b94'
              }
              //TODO: fetch the css and store to s3
              addedNodePromise = readCss(href).then(function (cssText) {
                //upload and change href
                console.log('hashing css');
                let key = md5(cssText);
                console.log('got key', key);
                let bucketName = 'siqstory-remote-assets';
                let resolve, reject;
                let s3Promise = new Promise(function (y, n) {
                  resolve = y;
                  reject = n;
                });
                var s3 = new aws.S3();
                console.log('creating bucket', bucketName);
                s3.createBucket({
                  Bucket: bucketName
                }, function (err) {
                  if (err) {
                    console.log('error creating s3 bucket');
                    resolve(addedNode);
                    return;
                  }
                  var params = {
                    Bucket: bucketName,
                    Key: key,
                    Body: cssText,
                    ContentType: 'text/css',
                    ACL: 'public-read'
                  };

                  console.log('attempting to put css in bucket');
                  s3.putObject(params, function (err, data) {
                    if (err) {
                      console.log('error putting to bucket', err);
                      reject(err);
                    } else {
                      console.log("Successfully uploaded data to myBucket/myKey")
                      addedNode.attributes['href'] = 'https://s3.amazonaws.com/' + bucketName + '/' + key;
                      resolve(addedNode);
                    };
                  });
                });
                return s3Promise;
              }, function fail(e) {
                //bummer, what should we do with that
                console.log('failed to read css', e);
                return addedNode;
              })
            }
          }
          return addedNodePromise;
        }));
        twistPromise = addedNodesPromise.then(function (addedNodes) {
          console.log('got added nodes');
          twist.addedNodes = addedNodes;
          return twist
        }, function reject(e) {
          console.log('something went wrong in added nodes returning twists', e);
          return twist;
        });
      }
      return twistPromise;
    }));

  twistPromises.then(function (twists) {
    story.twists = twists;
    console.log('got twists trying to save story');
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
  });
};

function readCss(href) {
  let resolve, reject;
  let promise = new Promise(function (y, n) {
    resolve = y;
    reject = n;
  });
  console.log('attempting to fetch css for', href);
  try {
    request
      .get(href, function (err, res) {
        if (err) {
          console.log('got error fetching css', err);
          reject(err);
        } else {
          console.log('success got css');
          resolve(res.body);
        }
      });
  } catch (e) {
    reject(e);
  }
  return promise;
}

// readCss('https://app.salesforceiq.com/public/css/riq.css?537d5ff02b95ba7bc8ccb525681f5b94').then(function (css) {
//   let hash = md5(css);
//   console.log('success', hash);
// });
module.exports.hello = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let result = 'default result';
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
