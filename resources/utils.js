(function () {

  'use strict';

  const _ = require('lodash');

  class Utils {

    constructor() {}

    /**
     * Kill process if we're going to exceed Twitter's rate limit
     * @param action {string}
     * @param serverResponse {object}
     */
    static checkRateLimit(action, serverResponse) {
      if (_.has(serverResponse.headers, 'x-rate-limit-remaining')) {
        let apiCallsRemaining = _.attempt(JSON.parse.bind(null, serverResponse.headers['x-rate-limit-remaining']));

        if (typeof apiCallsRemaining === 'number' && apiCallsRemaining < 2) {
          Utils.log(action, { name: 'ERROR', content: 'Rate limit reached' });
          process.exit(1);
        }
      }
    }

    static get imageExts() {
      return ['jpg', 'jpeg', 'png', 'gif'];
    }

    static log(action, info) {
      info = _.assign({}, { name: 'not provided', content: 'not provided' }, info);

      let cmd = [
        '[' + new Date() + ']',
        '[Action: ' + action + ']',
        info.name, '<' + info.content + '>'].join(' ');

      console.log(cmd);
    }

    static isImage(url) {
      let ext = url.split('.').pop();

      return this.imageExts.indexOf(ext) > -1;
    }
  }

  module.exports = Utils;

}).call(this);
