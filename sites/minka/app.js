exports = module.exports = createMinkaApp;

function createMinkaApp(express, passport, app, iniciativas, users) {

    var minka = require('./routes'),
        minka_path = "sites/minka/",
        config = require('../../config'),
        _ = require('underscore');

    app.get('/minka', minka.index);

    app.get('/minka/user/success_login', function(req, res, next) {
        res.redirect('/');
    });

    app.get('/minka/user/login', minka.login);


    function customMinkaCallbackAuthentification(strategy, req, res, next) {
        passport.authenticate(strategy, function loginCustomCallback(err, user, info) {
            if (err || !user) {
                //return res.redirect('/user/login'); 
                return res.render(minka_path+'login.html', {
                    layout: 'sites/minka/login.html',
                    layoutTitle: 'Login',
                    message: err || 'Usuario o Password incorrecto',
                    layoutId: 'user-login'
                })

            }

            req.logIn(user, function(err) {
                if (err) { return res.redirect('/iniciativa/create'); }
            });

            var redirectURL = '/iniciativa/edit';
            console.dir(req.session);
            if (req.session && req.session.redirectURL) {
                redirectURL = req.session.redirectURL;
                req.session.redirectURL = null;
            }

		console.log('REDIRECT UTL: '+redirectURL);
            return res.redirect(redirectURL);
        })(req, res, next);
    }



    app.post('/minka/user/login', function(req, res, next) {
        customMinkaCallbackAuthentification('local', req, res, next);
    });


/*
    app.get('/minka/auth/facebook', passport.authenticate('facebook', { callbackURL: '/auth/facebook/callback' }));

    app.get('/minka/auth/facebook/callback', function(req, res, next) {
        customMinkaCallbackAuthentification('facebook', req, res, next);
    });
    app.get('/minka/auth/twitter', passport.authenticate('twitter'));
    app.get('/minka/auth/twitter/callback', function(req, res, next) {
      customMinkaCallbackAuthentification('twitter', req, res, next);
    });

*/

/*
    app.get('/minka/auth/facebook/callback', function(req, res, next) {
        customMinkaCallbackAuthentification('facebook', req, res, next);
    });
*/

	app.get('/minka/auth/facebook', function(req, res, next) {
		if(!req.session) req.session = {};
		req.session.subdomain = (req.subdomains.length && req.subdomains[0]) || '';
		console.log('AITO MIKA DEBUG domain: '+req.session.subdomain);
		next();
	}, passport.authenticate('facebook'));

	app.get('/minka/auth/facebook/callback', function(req, res, next) {
		customMinkaCallbackAuthentification('facebook', req, res, next);
	});




    app.get('/minka/auth/twitter', passport.authenticate('twitter', { callbackURL: 'http://minka.'+config.system.DOMAIN_BASE+'/auth/twitter/callback' }));
    app.get('/minka/auth/twitter/callback', function(req, res, next) {
      customMinkaCallbackAuthentification('twitter', req, res, next);
    });



    app.get('/minka/user/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.post('/minka/user/signup', users.do_signup, function(req, res, next){
        customMinkaCallbackAuthentification('local', req, res, next);
        //res.redirect('/');
    });


    app.get('/minka/*', minka.index);

}

