angular.module('chascomusApp.menu', ['ngRoute','ui.router','ngResource'])

.controller('menu-controller', ['$scope', '$rootScope', '$timeout', '$location', function($scope, $rootScope, $timeout, $location) {
    $scope.showInPage = function(page) {
        return $rootScope.page == page;
    };
}]);

