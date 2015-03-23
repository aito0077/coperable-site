
angular.module('minkaApp', [
    'ngRoute',
    'ngResource',
    'ui.router',
    'minkaApp.services',
    'minkaApp.iniciativa',
    'minkaApp.user',
    'minkaApp.home'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  
    $routeProvider
    .when('/home', {
        templateUrl: '/static/sites/minka/partials/home/home.html',
        controller: 'HomeController'
    })
    .when('/iniciativa/edit', {
        templateUrl: '/static/sites/minka/partials/iniciativa/edit.html',
        controller: 'iniciativa-edit'
    })
    .when('/iniciativas', {
        templateUrl: '/static/sites/minka/partials/iniciativa/list.html',
        controller: 'iniciativa-list'
    })
    .when('/iniciativa/view', {
        templateUrl: '/static/sites/minka/partials/iniciativa/view.html',
        controller: 'iniciativa-view'
    })
    .otherwise({redirectTo: '/home'});
    
    $locationProvider.html5Mode(true);


}])
.run(function($rootScope, $window) {
    console.log('Minka!');

    $rootScope.user_id = $window.user_id;

});
