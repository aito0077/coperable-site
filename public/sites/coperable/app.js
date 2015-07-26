
angular.module('coperableApp', [
    'ngRoute',
    'ngResource',
    'ui.bootstrap',
    'elasticsearch',
    'ngMessages',
    'mgcrea.ngStrap',
    'satellizer',
    'djds4rce.angular-socialshare',
    'coperableApp.services',
    'coperableApp.iniciativa',
    'coperableApp.user',
    'coperableApp.comunidad',
    'coperableApp.home',
    'coperableApp.menu'
]).
config(['$routeProvider', '$locationProvider', '$authProvider', function($routeProvider, $locationProvider, $authProvider) {


    $routeProvider
    .when('/home', {
        templateUrl: '/static/sites/coperable/partials/home/home.html',
        controller: 'HomeController'
    })
    .when('/login', {
        templateUrl: '/static/sites/coperable/partials/user/login.html',
        controller: 'user-login'
    })
    .when('/signup', {
        templateUrl: '/static/sites/coperable/partials/user/login.html',
        controller: 'user-login'
    })
    .when('/iniciativas/edit', {
        templateUrl: '/static/sites/coperable/partials/iniciativa/edit.html',
        controller: 'iniciativa-edit'
    })
    .when('/iniciativas/edit/:id', {
        templateUrl: '/static/sites/coperable/partials/iniciativa/edit.html',
        controller: 'iniciativa-edit'
    })
    .when('/iniciativas', {
        templateUrl: '/static/sites/coperable/partials/iniciativa/list.html',
        controller: 'iniciativa-list'
    })
    .when('/iniciativas/:id', {
        templateUrl: '/static/sites/coperable/partials/iniciativa/view.html',
        controller: 'iniciativa-view'
    })
    .when('/info/enred', {
        templateUrl: '/static/sites/coperable/partials/static/red.html',
        controller: 'static-controller'
    })
    .when('/users/edit/:id', {
        templateUrl: '/static/sites/coperable/partials/user/edit.html',
        controller: 'user-edit'
    })
    .when('/users/:id', {
        templateUrl: '/static/sites/coperable/partials/user/profile.html',
        controller: 'user-view'
    })
    .otherwise({redirectTo: '/home'});
    
    $locationProvider.html5Mode(true);


    $authProvider.baseUrl = '/api/0.1/'; 
    $authProvider.loginOnSignup = true;
    $authProvider.loginRedirect = '/';
    $authProvider.logoutRedirect = '/';
    $authProvider.signupRedirect = '/login';
    $authProvider.loginUrl = '/auth/login';
    $authProvider.signupUrl = '/auth/signup';
    $authProvider.loginRoute = '/login';
    $authProvider.signupRoute = '/signup';
    $authProvider.tokenRoot = false; 
    $authProvider.tokenName = 'token';
    $authProvider.withCredentials = true;
    $authProvider.platform = 'browser';
    $authProvider.storage = 'localStorage';


    $authProvider.facebook({
        clientId: '295482087249664'
    });

    $authProvider.twitter({
        url: '/auth/twitter'
    });


    moment.locale('es');
    moment.tz.add('America/Argentina/Buenos_Aires|CMT ART ARST ART ARST|4g.M 40 30 30 20|0121212121212121212121212121212121212121213434343434343234343|-20UHH.c pKnH.c Mn0 1iN0 Tb0 1C10 LX0 1C10 LX0 1C10 LX0 1C10 Mn0 1C10 LX0 1C10 LX0 1C10 LX0 1C10 Mn0 MN0 2jz0 MN0 4lX0 u10 5Lb0 1pB0 Fnz0 u10 uL0 1vd0 SL0 1vd0 SL0 1vd0 17z0 1cN0 1fz0 1cN0 1cL0 1cN0 asn0 Db0 zvd0 Bz0 1tB0 TX0 1wp0 Rb0 1wp0 Rb0 1wp0 TX0 g0p0 10M0 j3c0 uL0 1qN0 WL0');

}])
.filter('moment', function() {
    return function(dateString, format) {
        //return moment(dateString).add(1, 'd').locale('es').format(format);
        return moment(dateString).locale('es').format(format);
    };
})
.filter('isBefore', function() {
    return function(dateString) {
        return moment().isAfter(dateString, 'day') ? 'past' : '';
    };
}).directive('ngReallyClick', [function() {
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
.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
})
.controller('static-controller', ['$scope','$rootScope', '$http', '$timeout', '$location', function($scope, $rootScope, $http, $timeout, $location) {
    $rootScope.page = 'enred';
}])
.controller('menu-controller', ['$scope', '$rootScope', '$timeout', '$location', '$auth', '$alert', '$http', function($scope, $rootScope, $timeout, $location, $auth, $alert, $http) {
    $scope.retrieving = false;
    $scope.logged = $auth.isAuthenticated();
    $scope.username = false;
    $scope.user_id = false;
    $scope.user = false;

    console.log('menuconroller');

    $scope.isAuthenticated = function() {
            
        if(!$scope.retrieving && !$scope.user &&  $auth.isAuthenticated() ) {
            $scope.retrieve_user();
        };
        return $auth.isAuthenticated();
    };

    $scope.showInPage = function(page) {
        return $rootScope.page == page;
    };

    $scope.retrieve_user = function() {
        $scope.retrieving = true;
            $http.get('/api/0.1/auth/me').
            success(function(data, status, headers, config) {
                $scope.user = data;
                $scope.retrieving = false;
                console.dir($scope.user);
                $scope.username = $scope.user.username;
                $scope.user_id = $scope.user._id;
                console.log($scope.username+' - '+$scope.user_id);
            }).error(function(data, status, headers, config) {
                $scope.retrieving = false;
                console.log('error');
            });
    };

    $scope.do_logout = function() {
        console.log('logout');
        if (!$auth.isAuthenticated()) {
            return;
        }
        console.log('relogout');
        $auth.logout()
        .then(function() {
            $alert({
            content: 'You have been logged out',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
            });
            $location.path('/');
        });

    };

    $scope.$on("$locationChangeStart", function (event, newUrl, oldUrl) {
        $scope.startPath = $location.path();
        $scope.startNewUrl = newUrl;
        $scope.startOldUrl = oldUrl;
    });
    $scope.$on("$locationChangeSuccess", function (event, newUrl, oldUrl) {
        $scope.successPath = $location.path();
        $scope.successNewUrl = newUrl;
        $scope.successOldUrl = oldUrl;
    });

    $scope.back = function () {
        $window.history.back();
    };

    $scope.forward = function () {
        $window.history.forward();
    };



}])


.run(function($rootScope, $window) {

    $rootScope.user_id = $window.user_id;

    //$rootScope.user_id = $window.user_id = '53c91943cc04da7b1d000006';
    Isotope.prototype.getFilteredItemElements = function() {
        var elems = [];
        for ( var i=0, len = this.filteredItems.length; i < len; i++ ) {
            elems.push( this.filteredItems[i].element );
        }
        return elems;
    };

});

