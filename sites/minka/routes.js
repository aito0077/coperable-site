var _ = require('underscore'),
    iniciativas = require('../../logic/iniciativas'),
    users = require('../../logic/users'),
    minka_path = "sites/minka/";

exports.index = function(req, res) {

  var geo = (req.session ? req.session.geo : false) ||
            (req.cookies ? req.cookies.geo : undefined);

      return res.render('sites/minka/index-ang.html', {
        layoutTitle: 'MINKA - Semana Colaborativa',
        layout: 'sites/minka/index-ang.html',
        layoutId: 'home-index',
        user: req.user,
        is_minka: req.user ? req.user.is_minka : false,
        geo: geo
      });


};

exports.create = function(req, res) {
  return res.render(minka_path+'iniciativa/create.html', {
    layoutTitle: 'Empezar Iniciativa',
    layout: 'sites/minka/layout.html',
    partials: {
        widget_address: 'widgets/address',
        head_resources: minka_path+'iniciativa/iniciativa_script_resources',
        bottom_resources: minka_path+'iniciativa/iniciativa_css_resources'
    }
  })
};

exports.edit = function(req, res) {
  var iniciativa_id = req.params['id'];
  iniciativas.findById(iniciativa_id, function(err, iniciativa) {
    iniciativa.description = JSON.parse(iniciativa.description);
    res.locals = _.extend(res.locals, {
      iniciativa: iniciativa,
      jsonIniciativa: JSON.stringify(iniciativa)
    });
    return res.render(minka_path+'iniciativa/create.html',{
        layout: 'sites/minka/layout.html',
      layoutTitle: 'Empezar Iniciativa',
      partials: {
        widget_address: 'widgets/address',
        head_resources: minka_path+'iniciativa/iniciativa_script_resources',
        bottom_resources: minka_path+'iniciativa/iniciativa_css_resources'      }
    });
  });

};


exports.success = function(req, res) {
  var iniciativa_id = req.params['id'];
  iniciativas.findById(iniciativa_id, function(err, iniciativa) {
    try {
      iniciativa.description = JSON.parse(iniciativa.description);
    }catch(e) {console.log(e);}

    if(iniciativa.owner) {
        iniciativa.creation_date = iniciativa.creation_date ? new Date(iniciativa.creation_date).toDateString() : '';
        users.profile(iniciativa.owner.user, function(err, user) {

        var first_iniciativa = _.size(user.iniciativas, function(model){ return model.owner; }) == 1;

        console.log("Primera iniciativa? "+first_iniciativa);

        res.locals = _.extend(res.locals, {
          profile: user,
          iniciativa: iniciativa,
		finalizada: iniciativa.finalizada,
		activando: iniciativa.activando,
		convocatoria: iniciativa.convocatoria,
          layoutTitle: iniciativa.name,
          layoutId: 'iniciativas-view',
        });
        return res.render(false && first_iniciativa ? minka_path+'iniciativa/first_created.html' : minka_path+'iniciativa/created_success.html',{
        layout: 'sites/minka/layout.html',
          partials: {
            map: 'widgets/map',
          }
        });
    });
    } else {
        res.send("");
    }
  });

};

exports.view = function(req, res) {
  var iniciativa_id = req.params['id'];
  iniciativas.findByIdWithOwnerAndMembers(iniciativa_id, 10, function(err, response) {
    var iniciativa = response.iniciativa;
    var owner = response.owner;
    var members = response.members;

    if (!iniciativa) {
      // TODO redirect to 404 page.
      return res.render(minka_path+'iniciativa/view.html',{
      partials: {
        map: 'widgets/map',
      }
    });
    }

    try {
      iniciativa.description = JSON.parse(iniciativa.description).replace(/\"/g,"");
    }catch(e) {console.error(e);}

    iniciativa.creation_date = iniciativa.creation_date ? new Date(iniciativa.creation_date).toDateString() : '';

    if (res.locals.user && res.locals.user.id) {
      res.locals.user['isOwner'] = (res.locals.user.id === iniciativa.owner.user || res.locals.user.id == '53b46479a7bb8d516500000d');
      res.locals.user['isMember'] = _.find(iniciativa.members,
          function(member) { return member.user === res.locals.user.id}) !== undefined;
    }

    res.locals = _.extend(res.locals, {
      owner: owner,
      iniciativa: iniciativa,
      members: members,
      layoutTitle: iniciativa.name,
      layoutId: 'iniciativas-view',
    });
    return res.render(minka_path+'iniciativa/view.html',{
        layout: 'sites/minka/layout.html',
      partials: {
        map: 'widgets/map',
      }
    });
  });

};

exports.view_slug = function(req, res) {
  console.log('route view_slug')
  var slug = req.params['slug'];
  iniciativas.findByName(slug, function(err, iniciativa) {
    try {
      iniciativa.description = JSON.parse(iniciativa.description);
    }catch(e) {console.log(e);}

    res.locals = _.extend(res.locals, {
      iniciativa: iniciativa,
      title: iniciativa.name
    });
    return res.render(minka_path+'iniciativa/view.html',{
        layout: 'sites/minka/layout.html',
      partials: {
        map: 'widgets/map'
      }
    });
  });

};

exports.list = function(req, res) {
  iniciativas.getTags({minka: true}, function(err, tags) {
      iniciativas.listQuery({minka: true}, function(err, iniciativas){
        if( req.xhr ) {
          return res.send(iniciativas)
        } else {
          return res.render(minka_path+'iniciativa/index.html', {
            layout: 'sites/minka/layout.html',
            layoutTitle: 'Iniciativas',
            layoutId: 'iniciativas-index',
            iniciativas: iniciativas,
            tags: tags,
            partials: {
                list: minka_path+'iniciativa/_list',
                iniciativaItemTemplate: minka_path+"templates/iniciativaItemTemplate.html"
            }
          })
        }
    });
  });
};

exports.profile = function(req, res) {
  var user_id = req.params['id'];
  users.profile(user_id, function(err, user) {

    if(!user.picture) {
        if(!user.minka_data || !user.minka_data.picture) {
            user.picture = 'user-12-mq.png';
        } else {
            user.picture = user.minka_data.picture;
        }
    }
    res.locals = _.extend(res.locals, {
      profile: user,
      title: 'Perfil'
    });
    return res.render(minka_path+'user/profile.html',{
        layout: 'sites/minka/layout.html',
		layoutTitle: 'Perfil',
		layoutId: 'user-login'
	});

  });

};

exports.login = function(req, res) {
    if(req.session) {
        req.session.redirectURL = req.query ? req.query.returnURL : '/';
        req.session.site = 'MINKA';
        return res.render(minka_path+'user/login.html', {
            layout: 'sites/minka/index-ang.html',
            layoutTitle: 'Login',
            layoutId: 'user-login'
        })
    }
};

exports.signup = function(req, res) {
  req.session.site = 'FECA';
  return res.render(minka_path+'user/signup.html', {
    layout: 'sites/minka/layout.html',
    layoutTitle: 'Registrate',
    layoutId: 'user-signup'
  })
};



