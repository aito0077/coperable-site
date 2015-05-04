
angular.module('chascomusApp', [
    'ngRoute',
    'ngResource',
    //'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'elasticsearch',
    'chascomusApp.services',
    'chascomusApp.iniciativa',
    'chascomusApp.user',
    'chascomusApp.home',
    'chascomusApp.menu'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  
    $routeProvider
    .when('/home', {
        templateUrl: '/static/sites/chascomus/partials/home/home.html',
        controller: 'HomeController'
    })
    .when('/iniciativas/edit', {
        templateUrl: '/static/sites/chascomus/partials/iniciativa/edit.html',
        controller: 'iniciativa-edit'
    })
    .when('/iniciativas/edit/:id', {
        templateUrl: '/static/sites/chascomus/partials/iniciativa/edit.html',
        controller: 'iniciativa-edit'
    })
    .when('/iniciativas', {
        templateUrl: '/static/sites/chascomus/partials/iniciativa/list.html',
        controller: 'iniciativa-list'
    })
    .when('/iniciativas/:id', {
        templateUrl: '/static/sites/chascomus/partials/iniciativa/view.html',
        controller: 'iniciativa-view'
    })
    .when('/info/enred', {
        templateUrl: '/static/sites/chascomus/partials/static/red.html',
        controller: 'static-controller'
    })
    .when('/users/edit/:id', {
        templateUrl: '/static/sites/chascomus/partials/user/edit.html',
        controller: 'user-edit'
    })
    .when('/users/:id', {
        templateUrl: '/static/sites/chascomus/partials/user/profile.html',
        controller: 'user-view'
    })
    .otherwise({redirectTo: '/home'});
    
    $locationProvider.html5Mode(true);

    moment.locale('es');
    moment.tz.add('America/Argentina/Buenos_Aires|CMT ART ARST ART ARST|4g.M 40 30 30 20|0121212121212121212121212121212121212121213434343434343234343|-20UHH.c pKnH.c Mn0 1iN0 Tb0 1C10 LX0 1C10 LX0 1C10 LX0 1C10 Mn0 1C10 LX0 1C10 LX0 1C10 LX0 1C10 Mn0 MN0 2jz0 MN0 4lX0 u10 5Lb0 1pB0 Fnz0 u10 uL0 1vd0 SL0 1vd0 SL0 1vd0 17z0 1cN0 1fz0 1cN0 1cL0 1cN0 asn0 Db0 zvd0 Bz0 1tB0 TX0 1wp0 Rb0 1wp0 Rb0 1wp0 TX0 g0p0 10M0 j3c0 uL0 1qN0 WL0');

}])
.filter('moment', function() {
    return function(dateString, format) {
        return moment(dateString).add(1, 'd').locale('es').format(format);
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
.controller('static-controller', ['$scope','$rootScope', '$http', '$timeout', '$location', function($scope, $rootScope, $http, $timeout, $location) {
    $rootScope.page = 'enred';
}])
 .run(function($rootScope, $window) {

    $rootScope.user_id = $window.user_id;
    //$rootScope.user_id = $window.user_id = '53c91943cc04da7b1d000006';

});

