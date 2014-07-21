var _ = require('underscore');
var iniciativas = require('../logic/iniciativas');

exports.index = function(req, res) {

  /*
  console.dir(req.cookies);

  var geo = (req.session ? req.session.geo : false) || (req.cookies ? req.cookies.geo : undefined);
  res.locals = {
    user: req.user,
    geo: geo,
    title: 'Home'
  };
  */

  /*
  return res.render('home/index',{
    partials: {
      head: 'wrapper/header',
      menu_site: 'wrapper/menu_site',
      footer: 'wrapper/footer',
      iniciativas_browser_command: 'wrapper/iniciativas_browser_commands',
      map: 'widgets/map',
      login_modal: 'user/login_widget'
    }
  });
  */
  var geo = (req.session ? req.session.geo : false) ||
            (req.cookies ? req.cookies.geo : undefined);

  return res.render('home/index.html', {
    layoutTitle: 'Coperable - Organizá y participa de iniciativas comunitarias y colaborativas',
    layoutId: 'home-index',
    user: req.user,
    geo: geo
  })
};
