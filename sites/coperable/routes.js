var _ = require('underscore'),
    iniciativas = require('../../logic/iniciativas'),
    users = require('../../logic/users'),
    coperable_path = "sites/coperable/";

exports.index = function(req, res) {

    var geo = (req.session ? req.session.geo : false) ||
            (req.cookies ? req.cookies.geo : undefined);

    return res.render('sites/coperable/index-res.html', {
        layoutTitle: 'Coperable (DEV)',
        layout: 'sites/coperable/index-res.html',
        layoutId: 'home-index',
        user: req.session.passport.user,
        coperable_admin: req.user &&  (""+req.user.id == '53b4592f7e0c217564000006'),
        is_coperable: req.user ? req.user.is_coperable : false,
        geo: geo
    });


};

/*
exports.login = function(req, res) {
    if(req.session) {
        req.session.redirectURL = req.query ? req.query.returnURL : '/';
        req.session.site = 'CHASCOMUS';
    }

    return res.render(coperable_path+'login.html', {
        layout: 'sites/coperable/login.html',
        layoutTitle: 'Login',
        layoutId: 'user-login'
    })
};

exports.signup = function(req, res) {
    req.session.site = 'CHASCOMUS';
    return res.render(coperable_path+'user/signup.html', {
        layout: 'sites/coperable/layout.html',
        layoutTitle: 'Registrate',
        layoutId: 'user-signup'
    })
};

*/


