exports = module.exports = createMinkaApp;

function createMinkaApp(express, passport, app, iniciativas, users) {

    var minka = require('./routes');

    app.get('/minka', minka.index);


    /*
    app.get('/minka/iniciativas', minka.list);
    app.get('/minka/iniciativas/create', minka.create);
    app.post('/minka/iniciativas/:id', iniciativas.save);
    app.post('/minka/iniciativas', iniciativas.create);
    app.get('/minka/iniciativas/name/:slug', minka.view_slug);
    app.get('/minka/iniciativas/:id', minka.view);
    app.get('/minka/iniciativas/success/:id', minka.success);
    app.get('/minka/iniciativas/:id/edit', minka.edit);

    */

    app.get('/minka/user/success_login', function(req, res, next) {
      res.redirect('/');
    });

    app.get('/minka/user/failure_login', function(req, res, next) {
      res.redirect('/user/login');
    });


    app.get(['/minka/user/login', '/minka/user/signup'], function(req, res, next){
      if(req.isAuthenticated()) {
        res.send({'result':'Ya estás logueado!'});
      }
      next('route')
    });

    app.get('/minka/user/login', minka.login);

/*
    app.get('/minka/user/signup', minka.signup);
    app.post('/minka/user/signup', users.do_signup, function(req, res){
      req.logout();
      res.redirect('/');
    });
*/
    app.get('/minka/auth/facebook/callback', function(req, res, next) {
      customMinkaCallbackAuthentification('facebook', req, res, next);
    });

    function customMinkaCallbackAuthentification(strategy, req, res, next) {
      passport.authenticate(strategy, function loginCustomCallback(err, user, info) {
          if (err) { return res.redirect('/user/failure_login'); }

          if (!user) { return res.redirect('/user/login'); }

          req.logIn(user, function(err) {
            if (err) { return res.redirect('/user/failure_login'); }
          });

          var redirectURL = '/';
          if (req.session.redirectURL) {
            redirectURL = req.session.redirectURL;
            req.session.redirectURL = null;
          }

          return res.redirect(redirectURL);
        }
      )(req, res, next);
    }



    app.post('/minka/user/login', function(req, res, next) {
      customMinkaCallbackAuthentification('local', req, res, next);
    });

    app.get('/minka/auth/facebook', passport.authenticate('facebook', { callbackURL: '/auth/facebook/callback' }));
    //app.get('/minka/auth/facebook', passport.authenticate('facebook'));
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

/*
    app.get('/minka/user/:id', minka.profile);
*/

    app.get('/minka/*', minka.index);

}

