var _ = require('underscore');
var iniciativas = require('../logic/iniciativas'),
    users = require('../logic/users');
var feca_path = "sites/feca/";

exports.index = function(req, res) {

  var geo = (req.session ? req.session.geo : false) ||
            (req.cookies ? req.cookies.geo : undefined);

  return res.render('sites/feca/home/index.html', {
    layoutTitle: 'Feca - Organizá y participa de iniciativas comunitarias y colaborativas',
    layout: 'sites/feca/layout.html',
    javascripts: ['map-browser.js'],
    partials: {
      iniciativaItemTemplate: "templates/iniciativaItemTemplate.html"
    },
    user: req.user,
    geo: geo
  });
};

exports.create = function(req, res) {
  return res.render(feca_path+'iniciativa/create.html', {
    layoutTitle: 'Empezar Iniciativa',
    partials: {
        widget_address: 'widgets/address',
        head_resources: 'iniciativa/iniciativa_script_resources',
        bottom_resources: 'iniciativa/iniciativa_css_resources'
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
    return res.render(feca_path+'iniciativa/create.html',{
      layoutTitle: 'Empezar Iniciativa',
      partials: {
        widget_address: 'widgets/address',
        head_resources: 'iniciativa/iniciativa_script_resources',
        bottom_resources: 'iniciativa/iniciativa_css_resources'      }
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
        return res.render(true || first_iniciativa ? feca_path+'iniciativa/first_created.html' : feca_path+'iniciativa/created_success.html',{
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
      return res.render(feca_path+'iniciativa/view.html',{
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
      res.locals.user['isOwner'] = (res.locals.user.id === iniciativa.owner.user);
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
    return res.render(feca_path+'iniciativa/view.html',{
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
    return res.render(feca_path+'iniciativa/view.html',{
      partials: {
        map: 'widgets/map'
      }
    });
  });

};

exports.list = function(req, res) {
  iniciativas.list(req, res, function(err, iniciativas){
    if( req.xhr ) {
      return res.send(iniciativas)
    } else {
      return res.render(feca_path+'iniciativa/index.html', {
        layoutTitle: 'Iniciativas',
        layoutId: 'iniciativas-index',
        iniciativas: iniciativas,
        partials: {
          list: 'iniciativa/_list',
	   iniciativaItemTemplate: "templates/iniciativaItemListTemplate.html"
        }
      })
    }
  });
};


