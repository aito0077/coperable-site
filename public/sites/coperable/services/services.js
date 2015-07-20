angular.module('coperableApp.services',['ngResource', 'elasticsearch'])
    .factory('Iniciativa',['$resource', function($resource){
        return $resource('/api/iniciativas/:id', { id:'@_id' }, {
            update: {
                method: 'PUT'
            }
        });
    }])
    .factory('Comunidad',['$resource', function($resource){
        return $resource('/api/0.1/comunidades/:id', { id:'@_id' }, {
            update: {
                method: 'PUT'
            }
        });
    }])
    .factory('Usuario',['$resource', function($resource){
        return $resource('/api/usuarios/:id', { id:'@_id' }, {
            update: {
                method: 'PUT'
            }
        });
    }])
    .factory('client',['esFactory', function(esFactory){
        return esFactory({
            hosts: [
		'http://coperable.coperable.org/es'
            ],
            requestTimeout: 30000 ,
            apiVersion: '1.4'
        });
    }]);
