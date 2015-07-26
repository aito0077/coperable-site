exports = module.exports = createCoperableApp;

function createCoperableApp(express, passport, app, iniciativas, users) {

    var coperable = require('./routes'),
        coperable_path = "sites/coperable/",
        config = require('../../config'),
        _ = require('underscore');

    app.get('/coperable', coperable.index);

    app.get('/coperable/user/success_login', function(req, res, next) {
        res.redirect('/');
    });

    app.get('/coperable/*', coperable.index);

}

