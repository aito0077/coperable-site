var _ = require('underscore'),
    iniciativas = require('../../logic/iniciativas'),
    users = require('../../logic/users'),
    minkanet_path = "sites/minkanet/";

exports.index = function(req, res) {

  var geo = (req.session ? req.session.geo : false) ||
            (req.cookies ? req.cookies.geo : undefined);

    console.dir(req.session.passport.user);

      return res.render('sites/minkanet/index-res.html', {
        layoutTitle: 'MINKA - Red',
        layout: 'sites/minkanet/index-res.html',
        layoutId: 'home-index',
        user: req.session.passport.user,
        minkanet_admin: req.user &&  (""+req.user.id == '53b4592f7e0c217564000006'),
        is_minkanet: req.user ? req.user.is_minkanet : false,
        geo: geo
      });


};

exports.login = function(req, res) {
    if(req.session) {
        req.session.redirectURL = req.query ? req.query.returnURL : '/';
        req.session.site = 'CHASCOMUS';
    }

    return res.render(minkanet_path+'login.html', {
        layout: 'sites/minkanet/login.html',
        layoutTitle: 'Login',
        layoutId: 'user-login'
    })
};

exports.signup = function(req, res) {
    req.session.site = 'CHASCOMUS';
    return res.render(minkanet_path+'user/signup.html', {
        layout: 'sites/minkanet/layout.html',
        layoutTitle: 'Registrate',
        layoutId: 'user-signup'
    })
};



