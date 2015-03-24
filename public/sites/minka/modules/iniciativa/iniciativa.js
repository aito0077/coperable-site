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
    $scope.persisted = false;

    $scope.geo = {};
    $scope.saving = false;
    $scope.hasError = false;

    $scope.prepareModel = function() {
        $scope.iniciativa.minka = true;
        if($scope.iniciativa.name) {
            $scope.iniciativa.slug = $scope.iniciativa.name.replace(/\s+/g, '_');
        }
        $scope.iniciativa.longitude = $scope.geo.longitude;
        $scope.iniciativa.latitude = $scope.geo.latitude;
        $scope.iniciativa.address = $scope.geo.direccion;
        $scope.iniciativa.direccion = $scope.geo.direccion;
        if($scope.geo) {
            $scope.iniciativa.location = $scope.geo;
            $scope.iniciativa.locality = $scope.geo.locality;
            if($scope.geo.locality) {
                $scope.iniciativa.country = $scope.geo.locality.country;
                $scope.iniciativa.city = $scope.geo.locality.city;
            }
        }

        $scope.iniciativa.hour = $('#hour').val();

        var start_date = $scope.iniciativa.fecha+" "+$scope.iniciativa.hour;
        var time_stamp = moment(start_date, 'DD-MM-YYYY hh:mmA');

        $scope.iniciativa.start_date_timestamp = time_stamp.toDate().getTime();
        $scope.iniciativa.end_date_timestamp = time_stamp.add(1, 'days').toDate().getTime();

        $scope.iniciativa.goal = '';
        $scope.iniciativa.duration = '';
        $scope.iniciativa.participants_amount =  '0';
        $scope.iniciativa.main_category ='arte_cultura';
        $scope.iniciativa.categories = {
            medio_ambiente: false,
            educacion: false,
            desarrollo: false,
            arte_cultura: true
        };
        $scope.iniciativa.activities = '';
        $scope.iniciativa.topics = '';

    };

    $scope.save = function(isValid) {
        $scope.saving = true;
        $scope.hasError = !isValid;
        $scope.prepareModel();
        if(isValid) {
            $scope.iniciativa.$save(function(data) {
                $scope.saving = false;
                console.dir(data);
                $scope.persisted = true;
            });

        }
    };

    $scope.setup_components = function() {

        var default_options = {
            format: 'd-m-y',
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

        $('#hour').timepicker({
            show2400: true
        });


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
                $scope.geo.latitude =  address.geometry.location.lat(),
                $scope.geo.longitude = address.geometry.location.lng()
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

    $scope.default_values = {
        goal:  '',
        duration:  '',
        participants_amount:   '0',
        main_category: 'arte_cultura',
        categories: {
            medio_ambiente: false,
            educacion: false,
            desarrollo: false,
            arte_cultura: true,
        },
        activities: [],
        topics: [],


    };


}])
.controller('iniciativa-list', ['$scope','$http', function($scope, $http) {
    console.log('iniciativa list');

}])
.controller('iniciativa-view', ['$scope','$http', function($scope, $http) {
    console.log('iniciativa view');

}]);

