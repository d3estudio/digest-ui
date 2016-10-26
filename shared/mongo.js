const MongoClient = require('mongodb').MongoClient;

const Mongo = function() {
  const url = process.env['MONGO_URL'] || 'mongodb://mongo/digest'
  this.itemsPerPage = process.env['ITEMS_PER_PAGE'] || 20;
  this.showLinksWithoutReaction = process.env['SHOW_ITEMS_WITHOUT_REACTION'];

  MongoClient.connect(url, (err, db) => {
    if(!!err) {
      console.error(`Mongo connection failed. Tried to connect to ${url}, but got the following error:`);
      console.error(err)
      process.exit(1);
    }
    console.log(`Connected to mongo @ ${url}`);
    this.client = db;
  });
}

Mongo.prototype = {
  getEmoji: function(names) {
    return this.client
      .collection('emojis')
      .find({ name: { $in: names }})
      .toArray()
      .then(m => m.map(e => ({
        name: e.name,
        repr: (e.url || e.unicode)
      })))
  },
  getItems: function(page = 1) {
    page = page || 1;
    const query = {};
    const opts = {};
    const skip = (page - 1) * this.itemsPerPage;
    if(!this.showLinksWithoutReaction) {
      query.$where = 'Object.keys(this.reactions).length > 0';
    }
    if(skip > 0) {
      opts.skip = skip;
    }

    return this.client
      .collection('items')
      .find(query, opts)
      .limit(this.itemsPerPage)
      .sort({ date: -1 })
      .toArray()
      .then(docs => {
        return docs.map(d => {
          return this
            .getEmoji(Object.keys(d.reactions))
            .then(emojis => {
              d.reactions = emojis;
              return d
            });
        });
      })
      .then(proms => Promise.all(proms))
      .then(docs => docs.map(d => ({
        reactions: d.reactions,
        data: JSON.parse(d.embededcontent),
      })))
  }
};

var inst = null;
module.exports = {
  sharedInstance: function() {
    return (inst = inst || new Mongo());
  }
}
