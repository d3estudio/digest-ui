var express = require('express');
var router = express.Router();
const mongo = require('../shared/mongo').sharedInstance();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/digest', function(req, res, next) {
  return mongo.getItems()
    .then(items => {
      return res.json(items);
    });
});

module.exports = router;
