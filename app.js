var config = require('./config'),
  express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  home = require('./routes/home'),
  feca = require('./routes/feca'),
  iniciativa = require('./routes/iniciativa'),
  development = require('./routes/development'),
  iniciativas = require('./logic/iniciativas'),
  users = require('./logic/users'),
  http = require('http'),
  path = require('path'),
  passport = require('passport'),
  pass_autentication = require('./logic/authentication'),
  redis = require('redis'),
  filehandler = require('./logic/filehandler'),
  RedisStore = require('connect-redis')(express);

var stylus = require('stylus')
var nib = require('nib')

var rClient = redis.createClient();
var sessionStore = new RedisStore({client:rClient});

var app = express();

app.engine('html', require('hogan-express'));
app.set('layout', 'layout.html');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('view options', { layout: false });
    //  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.urlencoded());
  app.use(express.multipart());
  app.use(express.session({
    store: sessionStore,
    key: 'jsessionid',
    secret: 'bl33dingumñoño'}
  ));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use('/static', express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/**
 * Ensure user authentification. If it's not logged in, redirect him there; else, go to the next
 * matching route.
 */
function ensureAuthenticated(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/user/login');
  }
  next('route');
}

function getSubdomain(h) {
  var parts = h.split(".");
    if(parts.length == 2) return "www";
    return parts[0];
}

/**
 * Load user information;then go to the next
 * matching route.
 */
function loadUserInformation(req, res, next) {
  var geo = (req.session ? req.session.geo : false) || (req.cookies ? req.cookies.geo : undefined);
  res.locals = {
    user: req.user,
    is_feca: req.user ? req.user.is_feca : false,
    geo: geo
  };

  next('route');
}

app.get('*', loadUserInformation);
app.get('/*/create', ensureAuthenticated);

app.get('/', home.index);

app.get('/feca', feca.index);


app.all( '*', function( req, res, next ) {
  res.header( 'Access-Control-Allow-Origin', '*' );
  res.header( 'Access-Control-Allow-Method', 'POST, GET, PUT, DELETE, OPTIONS' );
  res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-File-Name, Content-Type, Cache-Control' );
  if( 'OPTIONS' == req.method ) {
    res.send( 203, 'OK' );
  }
  next();
});


app.get('/feca/iniciativas', feca.list);
app.get('/feca/iniciativas/create', feca.create);
app.post('/feca/iniciativas/:id', iniciativas.save);
app.post('/feca/iniciativas', iniciativas.create);
app.get('/feca/iniciativas/name/:slug', feca.view_slug);
app.get('/feca/iniciativas/:id', feca.view);
app.get('/feca/iniciativas/success/:id', feca.success);
app.get('/feca/iniciativas/:id/edit', feca.edit);



app.get('/iniciativas', iniciativa.list);
app.get('/iniciativas/create', iniciativa.create);
app.post('/iniciativas/:id', iniciativas.save);
app.post('/iniciativas', iniciativas.create);
app.get('/iniciativas/name/:slug', iniciativa.view_slug);
app.get('/iniciativas/:id', iniciativa.view);
app.get('/iniciativas/success/:id', iniciativa.success);
app.get('/iniciativas/:id/edit', iniciativa.edit);

app.get('/api/iniciativas/user/:userId', iniciativas.findByOwner);
app.get('/api/iniciativas/:id', iniciativas.get);
app.put('/api/iniciativas/:id', iniciativas.save);
app.post('/api/iniciativas/:id/:userId', iniciativas.participate);
app.post('/api/iniciativas/:id/:userId/quit', iniciativas.quitIniciativa);
app.post('/api/iniciativas/search', iniciativas.findByQuery);
app.post('/api/iniciativas', iniciativas.create);

app.get('/api/iniciativas', function(req, res, next) {
  if(req.query.category) {
    iniciativas.browseByCategory(req, res, function(err, iniciativas) {
      res.send(iniciativas);
    });
  } else {

    if(req.query.last) {
        iniciativas.listLast(req, res, function(err, iniciativas) {
          res.send(iniciativas);
        });
    } else {
        iniciativas.list(req, res, function(err, iniciativas) {
          res.send(iniciativas);
        });
    }
  }
});



app.get('/user/success_login', function(req, res, next) {
  res.redirect('/');
});

app.get('/user/failure_login', function(req, res, next) {
  res.redirect('/user/login');
  //res.send(403, 'El usuario no se encuentra.');
});


app.get(['/user/login', '/user/signup'], function(req, res, next){
  if(req.isAuthenticated()) {
    res.send({'result':'Ya estás logueado!'});
  }
  next('route')
});
app.get('/user/login', user.login);


app.get('/feca/user/success_login', function(req, res, next) {
  res.redirect('/');
});

app.get('/feca/user/failure_login', function(req, res, next) {
  res.redirect('/user/login');
  //res.send(403, 'El usuario no se encuentra.');
});


app.get(['/feca/user/login', '/user/signup'], function(req, res, next){
  if(req.isAuthenticated()) {
    res.send({'result':'Ya estás logueado!'});
  }
  next('route')
});
app.get('/feca/user/login', feca.login);



function customCallbackAuthentification(strategy, req, res, next) {
  passport.authenticate(strategy, function loginCustomCallback(err, user, info) {
      if (err) { return res.redirect('/user/failure_login'); }

      if (!user) { return res.redirect('/user/login'); }

      req.logIn(user, function(err) {
        if (err) { return res.redirect('/user/failure_login'); }
      });

      var redirectURL = '/user/success_login';
      if (req.session.redirectURL) {
        redirectURL = req.session.redirectURL;
        req.session.redirectURL = null;
      }

      return res.redirect(redirectURL);
    }
  )(req, res, next);
}

function customFecaCallbackAuthentification(strategy, req, res, next) {
  passport.authenticate(strategy, function loginCustomCallback(err, user, info) {
      if (err) { return res.redirect('/user/failure_login'); }

      if (!user) { return res.redirect('/user/login'); }

      req.logIn(user, function(err) {
        if (err) { return res.redirect('/user/failure_login'); }
      });

      var redirectURL = '/user/success_login';
      if (req.session.redirectURL) {
        redirectURL = req.session.redirectURL;
        req.session.redirectURL = null;
      }

      return res.redirect(redirectURL);
    }
  )(req, res, next);
}



app.post('/user/login', function(req, res, next) {
  customCallbackAuthentification('local', req, res, next);
});

app.post('/feca/user/login', function(req, res, next) {
  customFecaCallbackAuthentification('local', req, res, next);
});



app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', function(req, res, next) {
  customCallbackAuthentification('facebook', req, res, next);
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', function(req, res, next) {
  customCallbackAuthentification('twitter', req, res, next);
});

app.get('/user/signup', user.signup);
app.post('/user/signup', users.do_signup, function(req, res){
  req.logout();
  res.redirect('/');
});
app.get('/user/geolocalization/:latitud/:longitud', user.set_localization);
app.get('/user/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/feca/user/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/users', users.list);

app.get('/user/:id', user.profile);

app.get('/feca/user/:id', feca.profile);


app.post('/uploads', filehandler.upload);
app.post('/feca/uploads', filehandler.upload);
app.post('/gets3credentials', filehandler.createS3Policy);
app.get('/uploadsuccess', function(req, resp) {
  console.log('Exito en subir la imagen');
  res.send('OK');
});



app.get('/development/', development.index);
app.get('/development/doc', development.doc);
app.get('/development/control', development.control);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
