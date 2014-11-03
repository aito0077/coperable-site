var config = require('../config'),
    cop_api = require('../api_client/api'),
    us = require('underscore');

exports.get = function(req, res, done) {
  var id = req.params['id'];
  cop_api.client.get('/api/comunidades/'+id, function(err, req, res, comunidad) {
     res.send(comunidad);
  });
};

exports.findById = function(id, done) {
  cop_api.client.get('/api/comunidades/'+id, function(err, req, res, comunidad) {
    done(err, comunidad);
  });
};


exports.list = function(req, res, done) {
  cop_api.client.get('/api/comunidades', function(err, request, response, comunidades) {
    done(err, comunidades);
  });
};

