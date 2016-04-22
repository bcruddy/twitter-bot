#!/usr/bin/env node

'use strict';

var botName = process.argv.splice(2)[0];

var fs = require('fs'),
  async = require('async'),
  Utils = require(__dirname + '/resources/utils'),
  config = JSON.parse(fs.readFileSync(__dirname + '/config/tw.' + botName + '.json')),
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

}).group('prod').weight(config.action_weights.favorite);

bot.addAction('follow', function () {
  var follow = new Follow(bot, config);

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

}).group('prod').weight(config.action_weights.follow);

bot.addAction('unfollow', function () {
  var unfollow = new Unfollow(bot, config);

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

}).group('prod').weight(config.action_weights.unfollow);

(function doAction(i) {
  setTimeout(function () {
    let action = bot.randomWeightedAction(config.action_group);
    bot.now(action);

    if (i < config.actions_per_run)
      doAction(++i);
    else
      process.exit();
  }, 2500);
})(0);
