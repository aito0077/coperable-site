var config = require('../config'),
    cop_api = require('../api_client/api'),
    us = require('underscore');

exports.iniciativas_summary = function(req, res, done) {
  var id = req.params['id'];
  cop_api.client.get('/api/iniciativa/aggregations', function(err, request, response, result) {
     done(result);
  });
};

exports.search_iniciativas = function(req, res, done) {
    console.log(req.query.q);
  cop_api.client.get('/api/iniciativa/search?q='+req.query.q, function(err, request, response, results) {
    res.send(results);
  });
};


