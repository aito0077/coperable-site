var _ = require('underscore');

exports.about = function(req, res) {
  return res.render('institution/content.html', {
    layoutTitle: 'Acerca de Coperable',
    content: ' Texto aquí '
  })
};

exports.networks = function(req, res) {
  return res.render('institution/content.html', {
    layoutTitle: 'Nuestra Red',
    content: ' Texto aquí '
  })
};

exports.practices = function(req, res) {
  return res.render('institution/content.html', {
    layoutTitle: 'Buenas Prácticas',
    content: ' Texto aquí '
  })
};

exports.open_share = function(req, res) {
  return res.render('institution/content.html', {
    layoutTitle: 'Abierto y Colaborativo',
    content: ' Texto aquí '
  })
};


