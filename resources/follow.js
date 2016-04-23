(function () {

  'use strict';

  const _ = require('lodash');
  const Utils = require('./utils');

  
  class Follow {

    constructor(bot, config) {
      this.bot = bot;
      this.config = config;
    }

    selectFollowerByHandle(callback) {
      let opt = { screen_name: this.config.handle };

      this.bot.get('followers/ids', opt, (err, data, res) => {
        if (err)
          return callback(err);

        Utils.checkRateLimit('Follow', res);

        if (_.has(data, 'ids'))
          callback(null, _.sample(data.ids));
        else
          callback('Follow.selectFollowerByHandle: bad follower data');
      });
    }

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
