var _ = require('underscore'),
    iniciativas = require('../../logic/iniciativas'),
    users = require('../../logic/users'),
    minka_path = "sites/minka/";

exports.index = function(req, res) {

  var geo = (req.session ? req.session.geo : false) ||
            (req.cookies ? req.cookies.geo : undefined);

      return res.render('sites/minka/index-ang.html', {
        layoutTitle: 'MINKA - Semana Colaborativa',
        layout: 'sites/minka/index-ang.html',
        layoutId: 'home-index',
        user: req.user,
        minka_admin: req.user &&  (""+req.user.id == '53b4592f7e0c217564000006'),
        is_minka: req.user ? req.user.is_minka : false,
        geo: geo
      });


};

exports.login = function(req, res) {
    if(req.session) {
        req.session.redirectURL = req.query ? req.query.returnURL : '/';
        console.log('Redirect To? '+req.session.redirectURL);
        req.session.site = 'MINKA';
    }

    return res.render(minka_path+'login.html', {
        layout: 'sites/minka/login.html',
        layoutTitle: 'Login',
        layoutId: 'user-login'
    })
};

exports.signup = function(req, res) {
    req.session.site = 'FECA';
    return res.render(minka_path+'user/signup.html', {
        layout: 'sites/minka/layout.html',
        layoutTitle: 'Registrate',
        layoutId: 'user-signup'
    })
};



