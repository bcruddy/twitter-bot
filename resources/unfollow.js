
'use strict';

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
  getMyFriendsList (callback) {
    this.bot.get('friends/list', {}, (err, data) => {
      if (err)
        return callback(err);

      let friendIdList = data.users
                          .filter(u => !u.verified)
                          .filter(u => u.followers_count < this.config.min_follower_count)
                          .filter(u => !this.config.whitelist.contains(u.screen_name))
                          .map(u => u.id).join(', ');

      callback(null, friendIdList);
    });
  }

  /**
   * Select a user that I follow that does not follow me
   *
   * @param friendIdList {string}
   * @param callback {Function}
   */
  selectNonfollowerFromList (friendIdList, callback) {
    let opt = { user_id: friendIdList };
    this.bot.get('friendships/lookup', opt, (err, data) => {
      if (err)
        return callback(err);

      let nonfollowers = data.filter(user => !user.connections.contains('followed_by'));

      callback(null, nonfollowers.sample());
    });

  }

  unfollowUser (user, callback) {
    let opt = { screen_name: user.screen_name };
    this.bot.post('friendships/destroy', opt, (err, data) => {
      if (err)
        return callback(err);

      let result = { name: '@' + data.screen_name, content: data.id.toString() };

      callback(null, result);
    });
  }

}

module.exports = Unfollow;
