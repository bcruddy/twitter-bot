(function () {

  'use strict';
  const _ = require('lodash'),
    moment = require('moment'),
    Utils = require(__dirname + '/../resources/utils');


  class Follow {

    constructor(bot, config) {
      this.bot = bot;
      this.config = config;
    }

    /**
     * Choose random follower from handle set in config
     * @param callback {Function}
     */
    selectFollowerByHandle(callback) {
      let opt = { screen_name: this.config.handle };

      this.bot.get('followers/ids', opt, (err, data, res) => {
        if (err)
          return callback(err);

        Utils.checkRateLimit('Follow', res);
        // TODO: cache these ids so we dont need to make an api call every time
        if (_.has(data, 'ids'))
          callback(null, _.sample(data.ids));
        else
          callback('Follow.selectFollowerByHandle: bad follower data');
      });
    }

    /**
     * Choose a random follower from a given twitter account id
     * @param id {Number} - twitter user id to select new follow from
     * @param callback
     */
    getUserIdToFollow(id, callback) {
      let opt = { user_id: id };

      this.bot.get('followers/ids', opt, (err, data, res) => {
        if (err)
          return callback(err);

        Utils.checkRateLimit('Follow', res);

        if (_.has(data, 'ids'))
          callback(null, _.sample(data.ids));
        else
          callback('Follow.getUserIdToFollow: bad follower data');
      });
    }

    /**
     * Follow user
     * @param id {Number}
     * @param callback {Function}
     */
    followUserById(id, callback) {
      let opt = { user_id: id, follow: true };

      this.bot.post('friendships/create', opt, (err, data) => {
        if (err)
          return callback(err);

        if (_.has(data, 'id'))
          callback(null, data);
        else
          callback('Follow.followUserById: follow request returned no data');
      });
    }

  }

  module.exports = Follow;

}).call(this);
