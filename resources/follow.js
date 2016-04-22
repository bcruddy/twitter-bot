
'use strict';

var Utils = require('./utils');

class Follow {
  constructor(bot, config) {
    this.bot = bot;
    this.config = config;
  }

  selectFollowerByHandle (callback) {
    let opt = { screen_name: this.config.handle };
    
    this.bot.get('followers/ids', opt, (err, data, res) => {
      if (err)
        return callback(err);

      Utils.checkRateLimit('Follow', res);

      callback(null, data.ids.sample());
    });
  }

  getUserIdToFollow (id, callback) {
    let opt = { user_id: id };
    this.bot.get('followers/ids', opt, (err, data, res) => {
      if (err)
        return callback(err);

      Utils.checkRateLimit('Follow', res);

      callback(null, data.ids.sample());
    });
  }

  followUserById (id, callback) {
    let opt = { user_id: id, follow: true };
    this.bot.post('friendships/create', opt, (err, data) => {
      if (err)
        return callback(err);

      callback(null, data);
    });
  }

}

module.exports = Follow;
