/**
 * Created by bruddy on 4/27/16.
 */
(function () {

  'use strict';

  const _ = require('lodash'),
    moment = require('moment'),
    Utils = require('./utils');


  class ValidationHelper {
    constructor(bot, config) {
      this.bot = bot;
      this.config = config;
    }

    shouldFollow(userId, callback) {
      if (callback === void 0 || typeof callback !== 'function') { callback = _.noop; }
      // get user tweet history statuses/user_timeline
      let opts = { user_id: userId, count: 200, exclude_replies: true };
      this.bot.get('statuses/user_timeline', opts, (err, data, res) => {
        if (err)
          return callback(err);

        let result = this.isValidAccount(data);
        if (result.valid)
          callback(null, userId);
        else
          callback(result.reason);
      });
    }

    isValidAccount(tweets) {
      let totalCount = tweets.length;
      let notSensitive = _.filter(tweets, t => !t.possibly_sensitive);

      if (totalCount > notSensitive)
        return { valid: false, reason: 'Timeline contains tweets considered possibly sensitive' };

      let lastTweetCreated = moment(tweets[0].created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
      let now = moment(new Date);
      let isWithinTwoMonths = lastTweetCreated.diff(now, 'months') > -2;

      return { valid: isWithinTwoMonths, reason: isWithinTwoMonths ? null : 'Last tweet was over two months ago' };
    }

  }

  module.exports = ValidationHelper;

}).call(this);
