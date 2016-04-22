/**
 * Created by <briancruddy at gmail dot com> on 5/21/15.
 * https://github.com/bcruddy @bcruddy
 * https://github.com/bcruddy/tweetreddit @badatmyjob
 */

'use strict';

var request = require('request');
var _ = require('lodash');
var Utils = require('./utils');

class Reddit {

    constructor (settings) {
        let defaults = {
            subreddits: [],
            count: 8
        };

        this.settings = _.extend(defaults, settings);
        this.mediaUrls = [];
    }

    get requestUri () {
        return 'http://reddit.com/r/' + this.settings.subreddits.join('+') + '/.json?limit=' + this.settings.count;
    }

    getPosts (callback) {
        if (!Utils.isFn(callback)) {
            callback = function (data) {
                Utils.log('Get content', { name: 'reddit.getPosts', content: data });
            };
        }

        return request({
            uri: this.requestUri,
            headers: {
                'Accept': '*/*',
                'User-Agent': '' // TODO set user agent in reddit config?
            }
        }, callback);
    }

    isPostValid (post) {
        let isValid = post.data.title.length < 120 &&
            Utils.isImage(post.data.url) &&
            this.mediaUrls.indexOf(post.data.url) === -1;

        if (!isValid)
            return isValid;

        this.mediaUrls.push(post.data.url);

        return isValid;
    }

}

module.exports = Reddit;