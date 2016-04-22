#!/usr/bin/env node

'use strict';

var Utils = require(__dirname + '/resources/utils.js');

// var config = {
//   keenan: 'tw.keenan.json',
//   photofy: 'tw.photofy.json',
//   badatmyjob: 'tw.badatmyjob.json'
// };
//
var botName = process.argv.splice(2)[0];
// if (!config.hasOwnProperty(botName)) {
//   Utils.log('ERROR', { name: 'Not found', content: 'config for ' + botName + ' was not found' }, botName);
//   process.exit();
// }

var async = require('async'),
  request = require('request'),
  TwitterBot = require(__dirname + '/resources/twitterbot.js').TwitterBot,
  Bot = new TwitterBot(__dirname + '/config/tw.' + botName + '.json');

var TwitterLocations = {
  Raleigh: 2478307
};

Bot.addAction('favorite', function () {
  async.waterfall([
    (callback) => {
      let opt = { id: TwitterLocations.Raleigh };
      Bot.get('trends/place', opt, (err, data) => {
        if (err)
          return callback(err);

        let d = data.sample();
        callback(null, d.trends.sample());
      });
    },
    (trend, callback) => {
      let opt = { q: trend.query, count: 25 };
      Bot.get('search/tweets', opt, (err, data) => {
        if (err)
          return callback(err);

        callback(null, data.statuses.sample());
      });
    },
    (selected, callback) => {
      let opt = { id: selected.id_str };
      Bot.post('favorites/create', opt, (err, data) => {
        if (err)
          return callback(err);

        callback(null, data.user);
      });
    }
  ], (err, data) => {
    if (err) {
      return Utils.log('Favorite', { name: 'ERROR', content: err }, botName);
    }

    Utils.log('Favorite', { name: '@' + data.screen_name, content: data.id }, botName);
  });

}).group('prod').weight(2);

Bot.addAction('follow', function () {
  async.waterfall([
    (callback) => {
      let opt = { screen_name: 'badatmyjob' };
      Bot.get('followers/ids', opt, (err, data) => {
        if (err)
          return callback(err);

        callback(null, data.ids.sample());
      });
    },
    (id, callback) => {
      let opt = { user_id: id };
      Bot.get('followers/ids', opt, (err, data) => {
        if (err)
          return callback(err);

        callback(null, data.ids.sample());
      });
    },
    (id, callback) => {
      let opt = { user_id: id, follow: true };
      Bot.post('friendships/create', opt, (err, data) => {
        if (err)
          return callback(err);

        callback(null, data);
      });
    }
  ], (err, data) => {
    if (err) {
      return Utils.log('Follow', { name: 'ERROR', content: err }, botName);
    }

    Utils.log('Follow', { name: '@' + data.screen_name, content: data.id }, botName);
  });

}).group('prod').weight(6);

Bot.addAction('unfollow', function () {
  async.waterfall([
    (callback) => {
      let opt = {};
      Bot.get('friends/list', opt, function (err, data, res) {
        if (err)
          return callback(err);

        let followingIds = data.users.map(user => user.id).join(', ');
        callback(null, followingIds);
      });
    },
    (followingIds, callback) => {
      let opt = { user_id: followingIds };
      Bot.get('friendships/lookup', opt, function (err, data, res) {
        if (err)
          return callback(err);

        let nonfollower = data.filter(user => !user.connections.contains('followed_by'));

        callback(null, nonfollower.sample());
      });
    },
    (nonfollower, callback) => {
      let opt = { screen_name: nonfollower.screen_name };
      Bot.post('friendships/destroy', opt, function (err, data, res) {
        if (err)
          return callback(err);

        let result = { name: '@' + data.screen_name, content: data.id.toString() };

        callback(null, result);
      });
    }
  ], (err, data) => {
    if (err) {
      return Utils.log('Unfollow', { name: 'ERROR', content: err }, botName);
    }
    Utils.log('Unfollow', data, botName);
  });
}).group('prod').weight(6);

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  if (chunk === '\n') {
    Utils.log('TERMINATED', { name: 'user input', content: 'newline char' }, botName);
    console.log('----------');
    process.exit();
  }
});

console.log('----------');
Utils.log('START', { name: 'bot started', content: null }, botName);


(function doAction(i) {
  setTimeout(function () {
    let action = Bot.randomWeightedAction('prod');
    Bot.now(action);

    if (i < 3)
      doAction(++i);
    else
      process.exit();
  }, 2500);
})(0);