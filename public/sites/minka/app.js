
angular.module('minkaApp', [
    'ngRoute',
    'ngResource',
    'ui.router',
    'elasticsearch',
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

    moment.locale('es');

}])
.filter('moment', function() {
    return function(dateString, format) {
        return moment(dateString).format(format);
    };
})
.directive('ngReallyClick', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                var message = attrs.ngReallyMessage;
                if (message && confirm(message)) {
                    scope.$apply(attrs.ngReallyClick);
                }
            });
        }
    }
}])
.run(function($rootScope, $window) {
    console.log('Minka!');

    $rootScope.user_id = $window.user_id;

});

