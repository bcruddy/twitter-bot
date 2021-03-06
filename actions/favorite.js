(function () {

  'use strict';

  const _ = require('lodash'),
    Utils = require(__dirname + '/../resources/utils');


  class Favorite {

    constructor(bot, config) {
      this.bot = bot;
      this.config = config;
    }

    /**
     * Get trends by location set in config
     * @param callback {Function}
     */
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

    /**
     * Get tweets from trend, logic to check whether or not we should favorite it
     * @param trend {object}
     * @param callback {Function}
     */
    findTweetsByTrend(trend, callback) {
      let opt = { q: trend.query, count: 25 };

      this.bot.get('search/tweets', opt, (err, data, res) => {
        if (err)
          return callback(err);

        Utils.checkRateLimit('Favorite', res);

        let tweets = _.chain(data.statuses)
          .reject(t => t.possibly_sensitive)
          .filter(t => t.retweet_count > this.config.retweet_floor || t.favorite_count > this.config.favorite_floor)
          .value();

        if (_.has(data, 'statuses'))
          callback(null, _.sample(tweets));
        else
          callback('Favorite.findTweetsByTrend: bad status data');
      });
    }

    /**
     * Favorite tweet
     * @param tweet {object}
     * @param callback {Function}
     */
    favoriteTweet(tweet, callback) {
      if (tweet === void 0)
        return callback('favorite.favoriteTweet: tweet is undefined');
      
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
