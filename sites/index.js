exports = module.exports = createSites;

function createSites(express, passport, app, iniciativas, users) {
    var minka = require('./minka/app')(express, passport, app, iniciativas, users);
}

