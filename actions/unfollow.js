(function () {

  'use strict';

  const _ = require('lodash'),
    Utils = require(__dirname + '/../resources/utils');

  
  class Unfollow {

    constructor(bot, config) {
      this.bot = bot;
      this.config = config;
    }

    /**
     * get a filtered list of people I follow,
     * filter by:
     *  NOT verified, less than 3000 followers
     *
     * @param callback {Function}
     */
    getMyFriendsList(callback) {
      this.bot.get('friends/list', { count: 200 }, (err, data, res) => {
        if (err)
          return callback(err);

        Utils.checkRateLimit('Unfollow', res);

        let friendIdList = _.chain(data.users)
          .filter(u => u.followers_count < this.config.min_follower_count)
          .reject(u => u.verified ||  _.includes(this.config.whitelist, u.screen_name))
          .map(u => u.id)
          .slice(0, 90)
          .value();

        if (_.isArray(friendIdList))
          callback(null, friendIdList.join(','));
        else
          callback('Unfollow.getMyFriendsList: friendIdlist empty');
      });
    }

    /**
     * Select a user that I follow that does not follow me
     *
     * @param friendIdList {string}
     * @param callback {Function}
     */
    selectNonfollowerFromList(friendIdList, callback) {
      let opt = { user_id: friendIdList };

      this.bot.get('friendships/lookup', opt, (err, data, res) => {
        if (err)
          return callback(err);

        Utils.checkRateLimit('Unfollow', res);
        let nonfollowers = _.filter(data, u => !_.includes(u.connections, 'followed_by'));
        
        if (nonfollowers.length === 0)
          callback('Unfollow.selectNonfollowerFromList: could not retrieve valid user to unfollow');
        else if (_.isArray(nonfollowers))
          callback(null, _.sample(nonfollowers));
        else
          callback('Unfollow.selectNonfollowerFromList: nonfollowers is not an array');
      });
    }

    unfollowUser(user, callback) {
      if (user === void 0)
          return callback('Unfollow.unfollowUser: user not defined');
      let opt = { screen_name: user.screen_name };

      this.bot.post('friendships/destroy', opt, (err, data) => {
        if (err)
          return callback(err);

        if (_.has(data, 'id'))
          callback(null, data);
        else
          callback('Unfollow.unfollowUser: bad user data');
      });
    }

  }


  module.exports = Unfollow;

}).call(this);
