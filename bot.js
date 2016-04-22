#!/usr/bin/env node

'use strict';

var Utils = require(__dirname + '/resources/utils');

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
  bot = new TwitterBot(__dirname + '/config/tw.' + botName + '.json'),
  Favorite = require(__dirname + '/resources/favorite'),
  Follow = require(__dirname + '/resources/follow'),
  Unfollow = require(__dirname + '/resources/unfollow');


bot.addAction('favorite', function () {
  var favorite = new Favorite(bot);

  async.waterfall([
    favorite.getTrendsByPlace.bind(favorite),
    favorite.findTweetsByTrend.bind(favorite),
    favorite.favoriteTweet.bind(favorite)
  ], (err, data) => {
    if (err) {
      return Utils.log('Favorite', { name: 'ERROR', content: err }, botName);
    }

    Utils.log('Favorite', { name: '@' + data.screen_name, content: data.id }, botName);
  });

}).group('prod').weight(1);


bot.addAction('follow', function () {

  var follow = new Follow(bot, botName);
  async.waterfall([
    follow.selectFollowerByHandle.bind(follow),
    follow.getUserIdToFollow.bind(follow),
    follow.followUserById.bind(follow)
  ], (err, data) => {
    if (err) {
      return Utils.log('Follow', { name: 'ERROR', content: err }, botName);
    }

    Utils.log('Follow', { name: '@' + data.screen_name, content: data.id }, botName);
  });

}).group('prod').weight(2);


bot.addAction('unfollow', function () {

  var unfollow = new Unfollow(bot);
  async.waterfall([
    unfollow.getMyFriendsList.bind(unfollow),
    unfollow.selectNonfollowerFromList.bind(unfollow),
    unfollow.unfollowUser.bind(unfollow)
  ], (err, data) => {
    if (err) {
      return Utils.log('Unfollow', { name: 'ERROR', content: err }, botName);
    }
    Utils.log('Unfollow', data, botName);
  });

}).group('prod').weight(1);

console.log('Bot started');

(function doAction(i) {
  setTimeout(function () {
    let action = bot.randomWeightedAction('prod');
    bot.now(action);

    if (i < 3)
      doAction(++i);
    else
      process.exit();
  }, 2500);
})(0);