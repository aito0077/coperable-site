angular.module('minkaApp.home', ['ngRoute','ui.router','ngResource'])

.config(['$routeProvider', '$stateProvider', function($routeProvider, $stateProvider) {
    $routeProvider.when('/home', {
        templateUrl: '/static/sites/minka/partials/home/home.html',
        controller: 'HomeController'
    });
}])
.controller('HomeController', ['$scope','$http', function($scope, $http) {
    
    $scope.login_form_show = false;

    $scope.is_logged = function() {
        return window.user_id;
    };

    $scope.show_login = function() {
        $scope.login_form_show = true;
    };
/*
    $scope.user_default = new google.maps.LatLng(-34.615692,-58.432846);

    $scope.iniciativas = [];

    $scope.get_iniciativas = function() {
        $http.get('/api//').
        success(function(data, status, headers, config) {
            $scope.account = data;
            $scope.invoices = data.invoices;
        }).error(function(data, status, headers, config) {

        });


        $http.last_iniciativas.fetch({
            data: $.param({
                last: true,
                latitude: this.user_default.lat(),
                longitude: this.user_default.lng(),
                limit: 6
            }),
            success: function(last_iniciativas, response, options) {

            }
        });
    };

    var myOptions = {
        zoom: 3,
        center:  $scope.user_default,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    

    $scope.setup_components = function() {

        var $container = $('.agenda-isotope');

        $container.isotope({
            itemSelector : '.agenda-item',
            resizable: true,
            resizesContainer: true
        });

        $('#filters a').click(function(){
            var selector = $(this).attr('data-filter');
            $container.isotope({ filter: selector });
            return false;
        });

    };

    $scope.setup_components();

    */
}]);


/*
	var map = new GMaps({
		el: '#map_canvas',
        zoom: 12,
        center:  $scope.user_default,
        //mapTypeId: google.maps.MapTypeId.ROADMAP,
		scrollwheel: true,
		zoomControl : true,
		panControl : true,
		streetViewControl : false,
		mapTypeControl: true,
		overviewMapControl: true,
		clickable: false
	});

	var styles = [ 
	{
		"featureType": "road",
		"stylers": [
		{ "color": "#b4b4b4" }
		]
	},{
		"featureType": "water",
		"stylers": [
		{ "color": "#d8d8d8" }
		]
	},{
		"featureType": "landscape",
		"stylers": [
		{ "color": "#f1f1f1" }
		]
	},{
		"elementType": "labels.text.fill",
		"stylers": [
		{ "color": "#000000" }
		]
	},{
		"featureType": "poi",
		"stylers": [
		{ "color": "#d9d9d9" }
		]
	},{
		"elementType": "labels.text",
		"stylers": [
		{ "saturation": 1 },
		{ "weight": 0.1 },
		{ "color": "#000000" }
		]
	}

	];

	map.addStyle({
		styledMapName:"Styled Map",
		styles: styles,
		mapTypeId: "map_style"  
	});

	map.setStyle("map_style");
    */
