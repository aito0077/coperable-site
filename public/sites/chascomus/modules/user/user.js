angular.module('chascomusApp.user', ['ngRoute','ui.router','ngResource'])

.config(['$routeProvider', '$stateProvider', function($routeProvider, $stateProvider) {
  $routeProvider.when('/user', {
    templateUrl: '/static/sites/chascomus/partials/user/index.html',
    controller: 'UserController'
  });

}])
.controller('UserController', ['$scope','$http', function($scope, $http) {

}]);

