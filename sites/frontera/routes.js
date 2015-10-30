var _ = require('underscore'),
    iniciativas = require('../../logic/iniciativas'),
    users = require('../../logic/users'),
    frontera_path = "sites/frontera/";

exports.index = function(req, res) {

  var geo = (req.session ? req.session.geo : false) ||
            (req.cookies ? req.cookies.geo : undefined);

    console.dir(req.session.passport.user);

      return res.render('sites/frontera/index-res.html', {
        layoutTitle: 'FRONTERA - Red',
        layout: 'sites/frontera/index-res.html',
        layoutId: 'home-index',
        user: req.session.passport.user,
        frontera_admin: req.user &&  (""+req.user.id == '53b4592f7e0c217564000006'),
        is_frontera: req.user ? req.user.is_frontera : false,
        geo: geo
      });


};

exports.login = function(req, res) {
    if(req.session) {
        req.session.redirectURL = req.query ? req.query.returnURL : '/';
        req.session.site = 'CHASCOMUS';
    }

    return res.render(frontera_path+'login.html', {
        layout: 'sites/frontera/login.html',
        layoutTitle: 'Login',
        layoutId: 'user-login'
    })
};

exports.signup = function(req, res) {
    req.session.site = 'CHASCOMUS';
    return res.render(frontera_path+'user/signup.html', {
        layout: 'sites/frontera/layout.html',
        layoutTitle: 'Registrate',
        layoutId: 'user-signup'
    })
};



