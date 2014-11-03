var config = require('../config'),
    cop_api = require('../api_client/api'),
    us = require('underscore');


function prepare_to_persist(req, done) {
  var body = req.body.model ? JSON.parse(req.body.model) : req.body,
      activities = body.activities,
      topics = body.topics;

  var iniciativa_data = {
    tasks: new Array(),
    topics: new Array()
  };
  if (body._id) {
    delete body._id;
  } else {
    iniciativa_data.owner = {
      user: req.user.id,
      name: req.user.username
    };
  }
  //delete body.start_date;
  //delete body.end_date;

  if(activities) {
    us.each(activities.split(/,/), function(tag) {
      iniciativa_data.tasks.push({
        tag: tag,
        description: tag
      });
    });
    delete body.activities;
  }

  if(topics) {
    us.each(topics.split(/,/), function(topic) {
      iniciativa_data.topics.push(topic);
    });
    delete body.topics;
  }

  var full_data = us.extend({}, body, iniciativa_data);
  done(full_data);

};

exports.create = function(req, res, done) {
  prepare_to_persist(req, function(iniciativa_data) {
    cop_api.client.post('/api/iniciativa', iniciativa_data, function(err, request, response, obj) {
	    console.log('[iniciativas::create] Iniciativa creada. ' + (err? 'Error: ' + err : ''));
      res.send(obj);
    });
  });
};

exports.save = function(req, res, done) {
  var id = req.param('id');
  prepare_to_persist(req, function(iniciativa_data) {
    cop_api.client.post('/api/iniciativa/' + id, iniciativa_data, function(err, request, response, obj) {
      console.log('[iniciativas::create] Iniciativa [' + id + '] guardada. ' + (err? 'Error: ' + err : ''));
      res.send(obj);
    });
  });
};

exports.participate = function(req, res, done) {
  var id = req.param('id'),
     userId = req.param('userId');
  cop_api.client.post('/api/iniciativa/'+id+'/'+userId, {}, function(err, request, response, obj) {
    console.log("[iniciativas::participate] Participate response:");
    res.redirect('/iniciativas/' + id);
  });
};

exports.quitIniciativa = function(req, res, done) {
  var id = req.param('id'),
     userId = req.param('userId');
  cop_api.client.post('/api/iniciativa/'+id+'/'+userId+'/quit', {}, function(err, request, response, obj) {
    console.log("[iniciativas::quitIniciativa] quitIniciativa response:");
    res.redirect('/iniciativas/' + id);
  });
};

exports.findByOwner = function(req, res, done) {
    var id = req.params['userId'];
    cop_api.client.get('/api/iniciativa/user/'+id, function(err, request, response, obj) {
      res.send(obj);
    });
  }

exports.get = function(req, res, done) {
  var id = req.params['id'];
  console.log('id:' + id);
  cop_api.client.get('/api/iniciativa/'+id, function(err, req, res, iniciativa) {
    var current_stage = iniciativa.current_stage;
        iniciativa['finalizada'] = current_stage == 'FINALIZADO';
        iniciativa['activando'] = iniciativa['finalizada'] || current_stage == 'ACTIVO';
        iniciativa['convocatoria'] = iniciativa['activando'] || current_stage == 'PREPARACION';
     res.send(iniciativa);
  });
};

exports.findById = function(id, done) {
  cop_api.client.get('/api/iniciativa/'+id, function(err, req, res, iniciativa) {
    done(err, iniciativa);
  });
};

exports.findByName = function(name, done) {
  cop_api.client.get('/api/iniciativa/s_name/'+name, function(err, req, res, iniciativas) {
    us.each(iniciativas, function(iniciativa) {
        var current_stage = iniciativa.current_stage;
            iniciativa['finalizada'] = current_stage == 'FINALIZADO';
            iniciativa['activando'] = iniciativa['finalizada'] || current_stage == 'ACTIVO';
            iniciativa['convocatoria'] = iniciativa['activando'] || current_stage == 'PREPARACION';
        
    });
    done(err, iniciativas[0]);
  });
};

exports.findByQuery = function(req, res, done) {
    console.log('find by query');
  var query = req.body.model ? JSON.parse(req.body.model) : req.body;
  cop_api.client.post('/api/iniciativa/search', query, 
    function(err, request, response, iniciativas) {
        us.each(iniciativas, function(iniciativa) {
            var current_stage = iniciativa.current_stage;
                iniciativa['finalizada'] = current_stage == 'FINALIZADO';
                iniciativa['activando'] = iniciativa['finalizada'] || current_stage == 'ACTIVO';
                iniciativa['convocatoria'] = iniciativa['activando'] || current_stage == 'PREPARACION';
            
        });
        res.send(iniciativas);
    }
  );
};

exports.listQuery = function(query, done) {
  cop_api.client.post('/api/iniciativa/search', query, 
    function(err, request, response, iniciativas) {
        us.each(iniciativas, function(iniciativa) {
            var current_stage = iniciativa.current_stage;
                iniciativa['finalizada'] = current_stage == 'FINALIZADO';
                iniciativa['activando'] = iniciativa['finalizada'] || current_stage == 'ACTIVO';
                iniciativa['convocatoria'] = iniciativa['activando'] || current_stage == 'PREPARACION';
        });
        done(err, iniciativas);
    }
  );

};



exports.listLast = function(req, res, done) {
  console.log('/api/iniciativa/last/'+req.query.latitude+'/'+req.query.longitude+'?limit='+req.query.limit);
  cop_api.client.get('/api/iniciativa/last/'+req.query.latitude+'/'+req.query.longitude+'?limit='+req.query.limit,
    function(err, request, response, iniciativas) {
      us.each(iniciativas, function(iniciativa) {
          var current_stage = iniciativa.current_stage;
              iniciativa['finalizada'] = current_stage == 'FINALIZADO';
              iniciativa['activando'] = iniciativa['finalizada'] || current_stage == 'ACTIVO';
              iniciativa['convocatoria'] = iniciativa['activando'] || current_stage == 'PREPARACION';
      });
    done(err, iniciativas);
  });
};

exports.list = function(req, res, done) {
  cop_api.client.get('/api/iniciativa', function(err, request, response, iniciativas) {
    us.each(iniciativas, function(iniciativa) {
        var current_stage = iniciativa.current_stage;
            iniciativa['finalizada'] = current_stage == 'FINALIZADO';
            iniciativa['activando'] = iniciativa['finalizada'] || current_stage == 'ACTIVO';
            iniciativa['convocatoria'] = iniciativa['activando'] || current_stage == 'PREPARACION';
        
    });
    done(err, iniciativas);
  });
};

exports.browseByCategory = function(req, res, done) {
  var category= req.query['category'];
  console.log('Buscando por categoria: '+category);
  cop_api.client.get('/api/iniciativa/category/'+category, function(err, request, response, iniciativas) {
    us.each(iniciativas, function(iniciativa) {
        var current_stage = iniciativa.current_stage;
            iniciativa['finalizada'] = current_stage == 'FINALIZADO';
            iniciativa['activando'] = iniciativa['finalizada'] || current_stage == 'ACTIVO';
            iniciativa['convocatoria'] = iniciativa['activando'] || current_stage == 'PREPARACION';
        
    });
     done(err, iniciativas);
  });
};

exports.getTags = function(query, done) {
  cop_api.client.post('/api/tags', query, function(err, request, response, tags) {
     done(err, tags);
  });
};
/*


exports.getTags = function(req, res, done) {
  var query = req.body.model ? JSON.parse(req.body.model) : req.body;
  cop_api.client.post('/api/tags', query. function(err, request, response, tags) {
     done(err, tags);
  });
};


exports.browseByTagsAndTopics = function(req, res, done) {

};

exports.browseByTagsAndTopics = function(req, res, done) {
  var category= req.query['category'];
  console.log('Buscando por categoria: '+category);
  cop_api.client.get('/api/iniciativa/category/'+category, function(err, request, response, iniciativas) {
    us.each(iniciativas, function(iniciativa) {
        var current_stage = iniciativa.current_stage;
            iniciativa['finalizada'] = current_stage == 'FINALIZADO';
            iniciativa['activando'] = iniciativa['finalizada'] || current_stage == 'ACTIVO';
            iniciativa['convocatoria'] = iniciativa['activando'] || current_stage == 'PREPARACION';
        
    });
     done(err, iniciativas);
  });
};

*/


exports.findByIdWithOwnerAndMembers = function(id, number_of_members, done) {
  console.log('/api/iniciativa/withOwnerAndMembers/'+number_of_members+'/'+id);
  cop_api.client.get('/api/iniciativa/withOwnerAndMembers/'+number_of_members+'/'+id, function(err, req, res, iniciativa) {
    done(err, iniciativa);
  });
};
