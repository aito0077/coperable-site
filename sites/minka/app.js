exports = module.exports = createMinkaApp;

function createMinkaApp(express, passport, app, iniciativas, users) {

    var minka = require('./routes');

    app.get('/minka', minka.index);

    app.get('/minka/user/success_login', function(req, res, next) {
        res.redirect('/');
    });

    app.get('/minka/user/login', minka.login);

    app.get('/minka/auth/facebook/callback', function(req, res, next) {
        customMinkaCallbackAuthentification('facebook', req, res, next);
    });

    function customMinkaCallbackAuthentification(strategy, req, res, next) {
        passport.authenticate(strategy, function loginCustomCallback(err, user, info) {
            console.log('Error: '+err);
            console.log('User: '+user);
            if (err || !user) { return res.redirect('/user/login'); }

            console.log('No error con ususario ');

            req.logIn(user, function(err) {
                if (err) { return res.redirect('/iniciativa/create'); }
            });

            var redirectURL = '/';
            if (req.session && req.session.redirectURL) {
                redirectURL = req.session.redirectURL;
                req.session.redirectURL = null;
            }

            return res.redirect(redirectURL);
        })(req, res, next);
    }



    app.post('/minka/user/login', function(req, res, next) {
        customMinkaCallbackAuthentification('local', req, res, next);
    });


    app.get('/minka/auth/facebook', passport.authenticate('facebook', { callbackURL: '/auth/facebook/callback' }));

    app.get('/minka/auth/facebook/callback', function(req, res, next) {
        customMinkaCallbackAuthentification('facebook', req, res, next);
    });
    app.get('/minka/auth/twitter', passport.authenticate('twitter'));
    app.get('/minka/auth/twitter/callback', function(req, res, next) {
      customMinkaCallbackAuthentification('twitter', req, res, next);
    });


    app.get('/minka/user/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.post('/minka/user/signup', users.do_signup, function(req, res){
        req.logout();
        res.redirect('/');
    });


    app.get('/minka/*', minka.index);

}

