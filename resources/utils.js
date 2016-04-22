'use strict';

var cp = require('child_process');

Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.contains = function (item) {
  return this.indexOf(item) > -1;
};

class Utils {

  constructor() {}

  /**
   * Kill process if we're going to exceed Twitter's rate limit
   * @param action {string}
   * @param serverResponse {object}
   */
  static checkRateLimit (action, serverResponse) {
    if (serverResponse.headers.hasOwnProperty('x-rate-limit-remaining')) {
      var apiCallsRemaining = 0;
      try {
        apiCallsRemaining = parseInt(serverResponse.headers['x-rate-limit-remaining']);
      }
      catch (ex) {}

      if (apiCallsRemaining < 2) {
        Utils.log(action, { name: 'ERROR', content: 'Rate limit reached' });
        process.exit();
      }
    }
  }

  static get imageExts() {
    return ['jpg', 'jpeg', 'png', 'gif'];
  }

  static log(action, info, output) {
    if (info === void 0) info = {};
    if (!info.hasOwnProperty('name')) info.name = 'not provided';
    if (!info.hasOwnProperty('content')) info.content = 'not provided';

    if (output === void 0)
      output = 'unknown';

    var cmd = [
      '[Action:' + action + ']',
      '<' + info.name, info.content + '>',
      '[Timestamp: ' + new Date() + ']'].join(' ');

    console.log(cmd);
    cp.exec('echo "'+ cmd +'" >> $PWD/logs/' + output + '.log.txt');
  }

  static isImage(url) {
    let ext = url.split('.').pop();

    return this.imageExts.indexOf(ext) > -1;
  }

  static isFn(fn) {
    return fn && typeof fn === 'function';
  }
}

module.exports = Utils;