var comunidades = require('../logic/comunidades'),
    search = require('../logic/search'),
    moment = require('moment'),
    _ = require('underscore');

    moment.locale("es");

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
        
        var iniciativas = comunidad.iniciativas;
        _.each(iniciativas, function(iniciativa) {
            iniciativa.from_date = moment(iniciativa.start_date).format('DD MMMM');
            iniciativa.start_date_f = moment(iniciativa.start_date).format('dddd, DD MMMM, hh:mm');
moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
        });

        res.locals = _.extend(res.locals, {
            comunidad: comunidad.comunidad,
            moderators: comunidad.moderators || [],
            members: comunidad.miembros || [],
            participants: comunidad.participants || [],
            iniciativas: iniciativas || [],
            layoutTitle: comunidad.name,
            layoutId: 'comunidades-view',
        });

        return res.render('comunidades/single_view.html',{

        });
    });

};

