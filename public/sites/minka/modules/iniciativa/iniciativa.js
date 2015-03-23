angular.module('minkaApp.iniciativa', ['ngRoute','ui.router','ngResource'])

.config(['$routeProvider', '$stateProvider', function($routeProvider, $stateProvider) {
    $routeProvider.when('/iniciativa/edit', {
        templateUrl: '/static/sites/minka/partials/iniciativa/edit.html',
        controller: 'iniciativa-edit'
    }).when('/iniciativas', {
        templateUrl: '/static/sites/minka/partials/iniciativa/list.html',
        controller: 'iniciativa-list'
    }).when('/iniciativa/view', {
        templateUrl: '/static/sites/minka/partials/iniciativa/view.html',
        controller: 'iniciativa-view'
    });

}])
.controller('iniciativa-edit', ['$scope','$http', 'Iniciativa', function($scope, $http, Iniciativa) {

    $scope.iniciativa = new Iniciativa();

    $scope.geo = {};
    $scope.saving = false;

    $scope.validate = function() {
        return true; 
    };

    $scope.prepareModel = function() {
        $scope.iniciativa.slug = $scope.iniciativa.name.replace(/\s+/g, '_');
        $scope.iniciativa.longitiude = $scope.geo.longitud;
        $scope.iniciativa.latitud = $scope.geo.latitud;
        $scope.iniciativa.address = $scope.geo.direccion;
        $scope.iniciativa.direccion = $scope.geo.direccion;
        $scope.iniciativa.locality = $scope.geo.locality;
    };

    $scope.save = function() {
        $scope.saving = true;
        $scope.prepareModel();
        if($scope.validate()) {
            $scope.iniciativa.$save(function() {
                $location.path('/');
                $scope.saving = false;
            });

        }
    };

    $scope.setup_components = function() {

        var default_options = {
            format: 'd-m-YYYY',
            placeholder: 'Día Evento',
            minYear: 2015,
            maxYear: 2015,
            lang: 'es',
            lock: 'from'
        };

        $('#profile_picture').fileupload({
            dropZone: $('#dropzone'),
            dataType: 'json',
            clickable: true,
            url: '/uploads',
            done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                $scope.iniciativa.profile_picture = file.name;
                $('#dropzone').css('background-image', "url('"+file.thumbnailUrl+"')");
                $('#dropzone').addClass("with-image");
            });
            }
        });


        $("#fecha" ).dateDropper(default_options);

        var position = null;
        if ($scope.initial_marker) {
            position = new google.maps.LatLng($scope.initial_marker.latitude, $scope.initial_marker.longitude);
        } else {
            position = new google.maps.LatLng(-34.615692, -58.432846);
        }
        $scope.addresspicker = $( "#addresspicker" ).addresspicker();
        $scope.addresspickerMap = $( "#addresspicker_map" ).addresspicker({
            regionBias: "ar",
            map:      "#map_canvas",
            typeaheaddelay: 1000,
            mapOptions: {
                languaje: "es",
                zoom: 12,
                center: position
            }
        });
        if ($scope.initial_marker) {
            $scope.addresspickerMap.addresspicker('reloadPosition');
        }



        $scope.addresspickerMap.on("addressChanged", function(evt, address) {
            var localization = {};
            try {

                $scope.geo.raw = address;
                _.each(address.address_components, function(component) {
                    if(_.contains(component.types, 'country')) {
                        localization.country = component.long_name;
                    }
                    if(_.contains(component.types, 'administrative_area_level_1')) {
                        localization.state = component.long_name;
                    }
                    if(_.contains(component.types, 'locality')) {
                        localization.city = component.long_name;
                    }
                });

                $scope.geo.locality = localization;
                
                $scope.geo.direccion = address.formatted_address.replace(/Province/g, 'Provincia' );

            } catch(e) { }
                $scope.geo.latitud =  address.geometry.location.lat(),
                $scope.geo.longitud = address.geometry.location.lng()
        });

        $scope.addresspickerMap.on("positionChanged", function(evt, markerPosition) {
            markerPosition.getAddress( function(address) {
                if (address) {
                    $( "#addresspicker_map").val(address.formatted_address);
                }
            })
        });

    };

    $scope.setup_components();



}])
.controller('iniciativa-list', ['$scope','$http', function($scope, $http) {
    console.log('iniciativa list');

}])
.controller('iniciativa-view', ['$scope','$http', function($scope, $http) {
    console.log('iniciativa view');

}]);

/*
    name:  String,
    slug:  String,
    code:  String,
    goal:  String,
    duration:  String,
    description:   String,
    address:   String,
    profile_picture:   String,
    participants_amount:   String,
    phone:   String,
    email:   String,
    entrada:   String,
    main_category: String,
    categories: {
        medio_ambiente: {type: Boolean, default: false},
        educacion: {type: Boolean, default: false},
        desarrollo: {type: Boolean, default: false},
        arte_cultura: {type: Boolean, default: false},
    },
    owner: {
        user: String,
        name: String
    },
    comunidades: [{
        _id: String,
        name: String,
        since: { type: Date, default: Date.now }
    }],

    tasks: [{
        tag: String,
        description: String
    }],
    topics: [String],
    public: { type: Boolean, default: false},
    feca: { type: Boolean, default: false},
    stages: [{
        stage: String,
        description: String,
        start_date: { type: Date, default: Date.now, es_type:'date'},
        finish_date: { type: Date, default: Date.now, es_type:'date'}
    }],
    current_stage: String,
    version: Number,
    location: {
        latitude: {type: Number, default: 0},
        longitude: {type: Number, default: 0}
    },
    coords: [Number, Number],
    networks: {
        twitter: String,
        facebook: String,
        youtube: String,
        flickr: String,
        linkedin: String,
        delicious: String,
        vimeo: String
    },
    date: { type: Date, default: Date.now, es_type:'date' },
    start_date: { type: Date, default: Date.now, es_type:'date' },
    end_date: { type: Date, default: Date.now, es_type:'date' },
    creation_date: { type: Date, default: Date.now, es_type:'date' },
    modification_date: { type: Date, default: Date.now, es_type:'date' }

*/
