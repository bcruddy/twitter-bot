
'use strict';

class Follow {
  constructor(bot, botName) {
    this.bot = bot;
    this.botName = botName;
  }

  getHandleFromBotName () {
    var handles = {
      photofy: 'photofyapp',
      keenan: 'ckeenan05',
      badatmyjob: 'badatmyjob'
    };

    if (handles.hasOwnProperty(this.botName)) {
      return handles[this.botName];
    } else {
      return 'barstoolsports'; // TODO: use a better default than this
    }
  }

  selectFollowerByHandle (callback) {
    let handle = this.getHandleFromBotName();
    let opt = { screen_name: handle };
    this.bot.get('followers/ids', opt, (err, data) => {
      if (err)
        return callback(err);

      callback(null, data.ids.sample());
    });
  }

  getUserIdToFollow (id, callback) {
    let opt = { user_id: id };
    this.bot.get('followers/ids', opt, (err, data) => {
      if (err)
        return callback(err);

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