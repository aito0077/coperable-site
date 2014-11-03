var users = require('../logic/users'),
  _ = require('underscore');

exports.profile = function(req, res) {
  var user_id = req.params['id'];
  users.profile(user_id, function(err, user) {

    if(!user.picture) {
        user.picture = 'user-12-mq.png';
    }
    res.locals = _.extend(res.locals, {
      profile: user,
      title: 'Perfil'
    });

    if (res.locals.user && res.locals.user.id) {
      res.locals.user['isOwner'] = (res.locals.user.id === user._id);
    }


    return res.render('user/profile.html',{
		layoutTitle: 'Perfil',
		layoutId: 'user-login'
	});

  });

};

exports.login = function(req, res) {
  req.session.redirectURL = req.query.returnURL;
  return res.render('user/login.html', {
    layoutTitle: 'Login',
    layoutId: 'user-login'
  })
};

exports.signup = function(req, res) {
    var s3Credentials = {};
    return res.render('user/signup.html', {
        layoutTitle: 'Registrate',
        layoutId: 'user-signup',
        partials: {
            head_resources: 'user/user_script_resources'
        }
    })
};

exports.set_localization = function(req, res, done) {
  console.dir(req.params);
  var geo = {
    latitud: req.params['latitud'],
    longitud: req.params['longitud']
  };

  console.dir(geo);
  res.cookie('geo', {
    latitud: geo.latitud,
    longitud: geo.longitud
  },{ expires: new Date(Date.now() + 900000)});

  if(res.session) {
    res.session.geo = {
      latitud: geo.latitud,
      longitud: geo.longitud
    };
  }
  res.send('ok');
};

exports.edit = function(req, res) {
  var user_id = req.params['id'];
  users.profile(user_id, function(err, user) {
    res.locals = _.extend(res.locals, {
      usuario: user,
      jsonUsuario: JSON.stringify(user)
    });
    return res.render('user/signup.html',{
        layoutTitle: 'Editar Perfil',
        partials: {
            head_resources: 'user/user_script_resources'
        }
    });
  });

};



