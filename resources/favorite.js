(function () {

  'use strict';

  const _ = require('lodash');
  const Utils = require('./utils');

  
  class Favorite {

    constructor(bot, config) {
      this.bot = bot;
      this.config = config;
    }

    getTrendsByPlace(callback) {
      let opt = { id: this.config.location };

      this.bot.get('trends/place', opt, (err, data, res) => {
        if (err)
          return callback(err);

        Utils.checkRateLimit('Favorite', res);

        let d = _.sample(data);
        if (_.has(d, 'trends'))
          callback(null, _.sample(d.trends));
        else
          callback('Favorite.getTrendsByPlace: bad trend data');
      });
    }

    findTweetsByTrend(trend, callback) {
      let opt = { q: trend.query, count: 25 };

      this.bot.get('search/tweets', opt, (err, data, res) => {
        if (err)
          return callback(err);

        Utils.checkRateLimit('Favorite', res);

        if (_.has(data, 'statuses'))
          callback(null, _.sample(data.statuses));
        else
          callback('Favorite.findTweetsByTrend: bad status data');
      });
    }

    favoriteTweet(tweet, callback) {
      let opt = { id: tweet.id_str };

      this.bot.post('favorites/create', opt, (err, data) => {
        if (err)
          return callback(err);

        if (_.has(data, 'user'))
          callback(null, data.user);
        else
          callback('Favorite.favoriteTweet: bad user data');
      });
    }

  }


  module.exports = Favorite;

}).call(this);
