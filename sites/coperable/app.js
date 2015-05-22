exports = module.exports = createCoperableApp;

function createCoperableApp(express, passport, app, iniciativas, users) {

    var coperable = require('./routes'),
        coperable_path = "sites/coperable/",
        config = require('../../config'),
        _ = require('underscore');

    app.get('/coperable', coperable.index);

    app.get('/coperable/user/success_login', function(req, res, next) {
        res.redirect('/');
    });

    app.get('/coperable/user/login', coperable.login);

    function customCoperableCallbackAuthentification(strategy, req, res, next) {
        passport.authenticate(strategy, function loginCustomCallback(err, user, info) {
            if (err || !user) {
                return res.render(coperable_path+'login.html', {
                    layout: 'sites/coperable/login.html',
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

    app.post('/coperable/user/login', function(req, res, next) {
        customCoperableCallbackAuthentification('local', req, res, next);
    });

	app.get('/coperable/auth/facebook', function(req, res, next) {
		if(!req.session) req.session = {};
		req.session.subdomain = (req.subdomains.length && req.subdomains[0]) || '';
		next();
	}, passport.authenticate('facebook'));

	app.get('/coperable/auth/facebook/callback', function(req, res, next) {
		customCoperableCallbackAuthentification('facebook', req, res, next);
	});


    app.get('/coperable/auth/twitter', passport.authenticate('twitter', { callbackURL: 'http://coperable.'+config.system.DOMAIN_BASE+'/auth/twitter/callback' }));
    app.get('/coperable/auth/twitter/callback', function(req, res, next) {
      customCoperableCallbackAuthentification('twitter', req, res, next);
    });

    app.get('/coperable/user/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.post('/coperable/user/signup', users.do_signup, function(req, res, next){
        customCoperableCallbackAuthentification('local', req, res, next);
    });

    app.get('/coperable/*', coperable.index);

}

