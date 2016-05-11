#!/usr/bin/env node

(function () {

  'use strict';

  const botName = process.argv.splice(2)[0];
  const fs = require('fs'),
    async = require('async'),
    _ = require('lodash');

  const Utils = require(__dirname + '/resources/utils'),
    config = JSON.parse(fs.readFileSync(__dirname + '/config/tw.' + botName + '.json')),
    TwitterBot = require(__dirname + '/resources/twitterbot.js').TwitterBot,
    bot = new TwitterBot(config),
    Favorite = require(__dirname + '/actions/favorite'),
    Follow = require(__dirname + '/actions/follow'),
    Unfollow = require(__dirname + '/actions/unfollow'),
    ValidationHelper = require(__dirname + '/resources/validationHelper');


  bot.addAction('favorite', function () {
    const favorite = new Favorite(bot, config);

    async.waterfall([
      favorite.getTrendsByPlace.bind(favorite),
      favorite.findTweetsByTrend.bind(favorite),
      favorite.favoriteTweet.bind(favorite)
    ], (err, data) => {
      if (err)
        Utils.log('Favorite', { name: 'ERROR', content: err }, botName);
      else
        Utils.log('Favorite', { name: '@' + data.screen_name, content: data.id }, botName);
    });
  }).group('prod').weight(config.action_weights.favorite);


  bot.addAction('follow', function () {
    const follow = new Follow(bot, config);
    const validate = new ValidationHelper(bot, config);

    async.waterfall([
      follow.selectFollowerByHandle.bind(follow),
      follow.getUserIdToFollow.bind(follow),
      validate.shouldFollow.bind(validate),
      follow.followUserById.bind(follow)
    ], (err, data) => {
      if (err)
        Utils.log('Follow  ', { name: 'ERROR', content: err }, botName);
      else
        Utils.log('Follow  ', { name: '@' + data.screen_name, content: data.id }, botName);
    });
  }).group('prod').weight(config.action_weights.follow);


  bot.addAction('unfollow', function () {
    const unfollow = new Unfollow(bot, config);

    async.waterfall([
      unfollow.getMyFriendsList.bind(unfollow),
      unfollow.selectNonfollowerFromList.bind(unfollow),
      unfollow.unfollowUser.bind(unfollow)
    ], (err, data) => {
      if (err)
        Utils.log('Unfollow', { name: 'ERROR', content: err }, botName);
      else
        Utils.log('Unfollow', { name: '@' + data.screen_name, content: data.id }, botName);
    });
  }).group('prod').weight(config.action_weights.unfollow);


  _.times(config.actions_per_run, function () {
    setTimeout(() => {
      let action = bot.randomWeightedAction(config.action_group);
      bot.now(action);
    }, 3000);
  });

}).call(this);
