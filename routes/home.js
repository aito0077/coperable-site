var _ = require('underscore');
var iniciativas = require('../logic/iniciativas');

exports.index = function(req, res) {
    console.log('AITO: DEBUG: hostname: '+req.headers.host);

  var geo = (req.session ? req.session.geo : false) ||
            (req.cookies ? req.cookies.geo : undefined);

  return res.render('home/index.html', {
    layoutTitle: 'Coperable - Organizá y participa de iniciativas comunitarias y colaborativas',
    layoutId: 'home-index',
    javascripts: ['map-browser.js'],
    partials: {
      iniciativaItemTemplate: "templates/iniciativaItemTemplate.html"
    },
    user: req.user,
    geo: geo
  });
};
