var _ = require('underscore'),
    iniciativas = require('../../logic/iniciativas'),
    users = require('../../logic/users'),
    chascomus_path = "sites/chascomus/";

exports.index = function(req, res) {

  var geo = (req.session ? req.session.geo : false) ||
            (req.cookies ? req.cookies.geo : undefined);

      return res.render('sites/chascomus/index-res.html', {
        layoutTitle: 'Chascomus en Red',
        layout: 'sites/chascomus/index-res.html',
        layoutId: 'home-index',
        user: req.user,
        chascomus_admin: req.user &&  (""+req.user.id == '53b4592f7e0c217564000006'),
        is_chascomus: req.user ? req.user.is_chascomus : false,
        geo: geo
      });


};

exports.login = function(req, res) {
    if(req.session) {
        req.session.redirectURL = req.query ? req.query.returnURL : '/';
        req.session.site = 'CHASCOMUS';
    }

    return res.render(chascomus_path+'login.html', {
        layout: 'sites/chascomus/login.html',
        layoutTitle: 'Login',
        layoutId: 'user-login'
    })
};

exports.signup = function(req, res) {
    req.session.site = 'CHASCOMUS';
    return res.render(chascomus_path+'user/signup.html', {
        layout: 'sites/chascomus/layout.html',
        layoutTitle: 'Registrate',
        layoutId: 'user-signup'
    })
};



