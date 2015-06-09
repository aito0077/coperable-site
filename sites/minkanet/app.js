exports = module.exports = createMinkanetApp;

function createMinkanetApp(express, passport, app, iniciativas, users) {

    var minkanet = require('./routes'),
        minkanet_path = "sites/minkanet/",
        config = require('../../config'),
        _ = require('underscore');

    app.get('/minkanet', minkanet.index);

    app.get('/minkanet/user/success_login', function(req, res, next) {
        res.redirect('/');
    });

    app.get('/minkanet/user/login', minkanet.login);

    function customMinkanetCallbackAuthentification(strategy, req, res, next) {
        passport.authenticate(strategy, function loginCustomCallback(err, user, info) {
            if (err || !user) {
                return res.render(minkanet_path+'login.html', {
                    layout: 'sites/minkanet/login.html',
                    layoutTitle: 'Login',
                    message: err || 'Usuario o Password incorrecto',
                    layoutId: 'user-login'
                })

            }

            req.logIn(user, function(err) {
                if (err) { return res.redirect('/iniciativa/create'); }
            });
            console.dir(req.user);

            var redirectURL = '/';
            if (req.session && req.session.redirectURL) {
                console.log('REDIRECCIONAR A: '+req.session.redirectURL);
                redirectURL = req.session.redirectURL;
                req.session.redirectURL = null;
            }

            return res.redirect(redirectURL);
        })(req, res, next);
    }

    app.post('/minkanet/user/login', function(req, res, next) {
        customMinkanetCallbackAuthentification('local', req, res, next);
    });

	app.get('/minkanet/auth/facebook', function(req, res, next) {
		if(!req.session) req.session = {};
		req.session.subdomain = (req.subdomains.length && req.subdomains[0]) || '';
		next();
	}, passport.authenticate('facebook'));

	app.get('/minkanet/auth/facebook/callback', function(req, res, next) {
		customMinkanetCallbackAuthentification('facebook', req, res, next);
	});


    app.get('/minkanet/auth/twitter', passport.authenticate('twitter', { callbackURL: 'http://minkanet.'+config.system.DOMAIN_BASE+'/auth/twitter/callback' }));
    app.get('/minkanet/auth/twitter/callback', function(req, res, next) {
      customMinkanetCallbackAuthentification('twitter', req, res, next);
    });

    app.get('/minkanet/user/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.post('/minkanet/user/signup', users.do_signup, function(req, res, next){
        customMinkanetCallbackAuthentification('local', req, res, next);
    });

    app.get('/minkanet/*', minkanet.index);

}

