exports = module.exports = createFronteraApp;

function createFronteraApp(express, passport, app, iniciativas, users) {

    var frontera = require('./routes'),
        frontera_path = "sites/frontera/",
        config = require('../../config'),
        _ = require('underscore');

    app.get('/frontera', frontera.index);

    app.get('/frontera/user/success_login', function(req, res, next) {
        res.redirect('/');
    });

    app.get('/frontera/user/login', frontera.login);

    function customFronteraCallbackAuthentification(strategy, req, res, next) {
        passport.authenticate(strategy, function loginCustomCallback(err, user, info) {
            if (err || !user) {
                return res.render(frontera_path+'login.html', {
                    layout: 'sites/frontera/login.html',
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

    app.post('/frontera/user/login', function(req, res, next) {
        customFronteraCallbackAuthentification('local', req, res, next);
    });

	app.get('/frontera/auth/facebook', function(req, res, next) {
		if(!req.session) req.session = {};
		req.session.subdomain = (req.subdomains.length && req.subdomains[0]) || '';
		next();
	}, passport.authenticate('facebook'));

	app.get('/frontera/auth/facebook/callback', function(req, res, next) {
		customFronteraCallbackAuthentification('facebook', req, res, next);
	});


    app.get('/frontera/auth/twitter', passport.authenticate('twitter', { callbackURL: 'http://frontera.'+config.system.DOMAIN_BASE+'/auth/twitter/callback' }));
    app.get('/frontera/auth/twitter/callback', function(req, res, next) {
      customFronteraCallbackAuthentification('twitter', req, res, next);
    });

    app.get('/frontera/user/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.post('/frontera/user/signup', users.do_signup, function(req, res, next){
        customFronteraCallbackAuthentification('local', req, res, next);
    });

    app.get('/frontera/*', frontera.index);

}

