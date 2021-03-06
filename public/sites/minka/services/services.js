angular.module('minkaApp.services',['ngResource', 'elasticsearch'])
    .factory('Iniciativa',['$resource', function($resource){
        return $resource('/api/iniciativas/:id', { id:'@_id' }, {
            update: {
                method: 'PUT'
            }
        });
    }])
    .factory('client',['esFactory', function(esFactory){
        return esFactory({
            hosts: [
               'http://minka.coperable.org:81'
            ],
            requestTimeout: 30000 ,
            apiVersion: '1.4'
        });
    }]);
