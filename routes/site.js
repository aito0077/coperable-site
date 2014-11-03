var _ = require('underscore');

exports.about = function(req, res) {
  return res.render('institution/about.html', {
    layoutTitle: 'Acerca de Coperable',
    content: ' Texto aquí '
  })
};

exports.networks = function(req, res) {
  return res.render('institution/network.html', {
    layoutTitle: 'Nuestra Red',
    content: ' Texto aquí '
  })
};

exports.practices = function(req, res) {
  return res.render('institution/practices.html', {
    layoutTitle: 'Buenas Prácticas',
    content: ' Texto aquí '
  })
};

exports.open_share = function(req, res) {
  return res.render('institution/open.html', {
    layoutTitle: 'Abierto y Colaborativo',
    content: ' Texto aquí '
  })
};

exports.implementation= function(req, res) {
  return res.render('institution/implementation.html', {
  })
};

exports.social_analytic= function(req, res) {
  return res.render('institution/social_analytic.html', {
  })
};

exports.workshops= function(req, res) {
  return res.render('institution/workshops.html', {
  })
};

exports.rse= function(req, res) {
  return res.render('institution/rse.html', {
  })
};

