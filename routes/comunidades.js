var _ = require('underscore');

exports.view = function(req, res) {
    res.locals = _.extend(res.locals, {

    });
    return res.render('comunidades/single_view.html',{
	partials: {
      
	}
    });

};

exports.index = function(req, res) {
    res.locals = _.extend(res.locals, {

    });
    return res.render('comunidades/index.html',{
	partials: {
      
	}
    });

};

exports.extra = function(req, res) {
    res.locals = _.extend(res.locals, {

    });
    return res.render('comunidades/extra.html',{
	partials: {
      
	}
    });

};

