var comunidades = require('../logic/comunidades'),
    search = require('../logic/search'),
    _ = require('underscore');

exports.index = function(req, res) {
    res.locals = _.extend(res.locals, {

    });
    comunidades.list(req, res, function(err, comunidades) {
        if( req.xhr ) {
            return res.send(comunidades)
        } else {
            return res.render('comunidades/index.html', {
                layoutTitle: 'Comunidades',
                layoutId: 'comunidades-index',
                comunidades: comunidades
            });
        }
    });
};

exports.extra = function(req, res) {
    res.locals = _.extend(res.locals, {

    });
    search.iniciativas_summary(req, res, function(result) {
        return res.render('comunidades/extra.html', {
            summary: result.aggregations,
            hits: result.hits,
            partials: {
                search_control: 'widgets/search.html'
            }
        });
    });

};

exports.view = function(req, res) {
    var comunidad_id = req.params['id'];
    comunidades.findById(comunidad_id, function(err, comunidad) {

        if (!comunidad) {
            console.log("44440000004444");
        }

        try {
            comunidad.description = JSON.parse(comunidad.description).replace(/\"/g,"");
        } catch(e) {
            console.error(e);
        }

        if (res.locals.user && res.locals.user.id) {
            res.locals.user['isModerator'] = _.find(comunidad.moderators, function(moderator) { return moderator.user === res.locals.user.id}) !== undefined;
        }

        res.locals = _.extend(res.locals, {
            comunidad: comunidad,
            moderators: comunidad.moderators || [],
            members: comunidad.members || [],
            participants: comunidad.participants || [],
            iniciativas: comunidad.iniciativas || [],
            layoutTitle: comunidad.name,
            layoutId: 'comunidades-view',
        });

        return res.render('comunidades/single_view.html',{

        });
    });

};

