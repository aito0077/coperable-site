exports = module.exports = createChascomusApp;

function createChascomusApp(express, passport, app, iniciativas, users) {

    var chascomus = require('./routes'),
        chascomus_path = "sites/chascomus/",
        config = require('../../config'),
        _ = require('underscore');

    app.get('/chascomus', chascomus.index);

    app.get('/chascomus/user/success_login', function(req, res, next) {
        res.redirect('/');
    });

    app.get('/chascomus/user/login', chascomus.login);

    function customChascomusCallbackAuthentification(strategy, req, res, next) {
        passport.authenticate(strategy, function loginCustomCallback(err, user, info) {
            if (err || !user) {
                return res.render(chascomus_path+'login.html', {
                    layout: 'sites/chascomus/login.html',
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

    app.post('/chascomus/user/login', function(req, res, next) {
        customChascomusCallbackAuthentification('local', req, res, next);
    });

	app.get('/chascomus/auth/facebook', function(req, res, next) {
		if(!req.session) req.session = {};
		req.session.subdomain = (req.subdomains.length && req.subdomains[0]) || '';
		next();
	}, passport.authenticate('facebook'));

	app.get('/chascomus/auth/facebook/callback', function(req, res, next) {
		customChascomusCallbackAuthentification('facebook', req, res, next);
	});


    app.get('/chascomus/auth/twitter', passport.authenticate('twitter', { callbackURL: 'http://chascomus.'+config.system.DOMAIN_BASE+'/auth/twitter/callback' }));
    app.get('/chascomus/auth/twitter/callback', function(req, res, next) {
      customChascomusCallbackAuthentification('twitter', req, res, next);
    });

    app.get('/chascomus/user/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.post('/chascomus/user/signup', users.do_signup, function(req, res, next){
        customChascomusCallbackAuthentification('local', req, res, next);
    });

    app.get('/chascomus/*', chascomus.index);

}

