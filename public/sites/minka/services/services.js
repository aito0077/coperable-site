angular.module('minkaApp.services',['ngResource'])
    .factory('Iniciativa',['$resource', function($resource){
        return $resource('/iniciativas/:id', { id:'@_id' }, {
            update: {
                method: 'PUT'
            }
        });
    }]);
