
'use strict';

// var TwitterLocations = {
//   Raleigh: 2478307
// };

class Favorite {

  constructor(bot) {
    this.bot = bot;
  }

  get locations() {
    return {
      Raleigh: 2478307
    };
  }

  getTrendsByPlace (callback) {
    console.log(this);
    let opt = { id: this.locations.Raleigh };
    this.bot.get('trends/place', opt, (err, data) => {
      if (err)
        return callback(err);

      let d = data.sample();
      callback(null, d.trends.sample());
    });
  }

  findTweetsByTrend (trend, callback) {
    let opt = { q: trend.query, count: 25 };
    this.bot.get('search/tweets', opt, (err, data) => {
      if (err)
        return callback(err);

      callback(null, data.statuses.sample());
    });
  }

  favoriteTweet (tweet, callback)  {
    let opt = { id: tweet.id_str };
    this.bot.post('favorites/create', opt, (err, data) => {
      if (err)
        return callback(err);

      callback(null, data.user);
    });
  }

}

module.exports = Favorite;