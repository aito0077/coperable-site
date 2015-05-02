angular.module('chascomusApp.iniciativa', ['ngRoute','ui.router','ui.bootstrap','ngResource'])

.config(['$routeProvider', '$stateProvider', function($routeProvider, $stateProvider) {
    $routeProvider
    .when('/iniciativa/edit', {
        templateUrl: '/static/sites/chascomus/partials/iniciativa/edit.html',
        controller: 'iniciativa-edit'
    })
    .when('/iniciativa/edit/:id', {
        templateUrl: '/static/sites/chascomus/partials/iniciativa/edit.html',
        controller: 'iniciativa-edit'
    })
    .when('/iniciativas', {
        templateUrl: '/static/sites/chascomus/partials/iniciativa/list.html',
        controller: 'iniciativa-list'
    })
    .when('/iniciativa/:id', {
        templateUrl: '/static/sites/chascomus/partials/iniciativa/view.html',
        controller: 'iniciativa-view'
    });

}])
.controller('iniciativa-edit', ['$scope','$http', '$routeParams', '$location', '$anchorScroll', '$timeout', '$rootScope', 'Iniciativa', 'Usuario', function($scope, $http, $routeParams, $location, $anchorScroll, $timeout, $rootScope, Iniciativa, Usuario) {

    $scope.first_time = false;
    $scope.geo = {};
    $scope.saving = false;
    $scope.hasError = false;
    $scope.persisted = false;

    $scope.topicos = [

        { "value": "Taller"   ,"text": "Taller"   , "continent": "naturaleza"    },
        { "value": "Seminario"   ,"text": "Seminario"   , "continent": "naturaleza"    },
        { "value": "Espectaculo"   ,"text": "Espectaculo"   , "continent": "naturaleza"    },
        { "value": "Feria"   ,"text": "Feria"   , "continent": "naturaleza"    },
        { "value": "Encuentro"   ,"text": "Encuentro"   , "continent": "naturaleza"    },
        { "value": "Peña"   ,"text": "Peña"   , "continent": "naturaleza"    },
        { "value": "Gratis"   ,"text": "Gratis"   , "continent": "price"    },
        { "value": "A la Gorra", "text": "A la Gorra"   , "continent": "price"    },
        { "value": "Arancelada"   ,"text": "Arancelada"   , "continent": "price"    },
        { "value": "Centro"   ,"text": "Centro"   , "continent": "place"    },
        { "value": "El Hueco", "text": "El Hueco"   , "continent": "place"    },
        { "value": "Iporá"   ,"text": "Iporá"   , "continent": "place"    },
        { "value": "Tallo Blanco", "text": "Tallo Blanco"   , "continent": "place"    },
        { "value": "30 de Mayo", "text": "30 de Mayo"   , "continent": "place"    },
        { "value": "San Cayetano", "text": "San Cayetano"   , "continent": "place"    },
        { "value": "Los Sauces", "text": "Los Sauces"   , "continent": "place"    },
        { "value": "El Porteño", "text": "El Porteño"   , "continent": "place"    },
        { "value": "Monte Corti", "text": "Monte Corti"   , "continent": "place"    },
        { "value": "Parque Girado", "text": "Parque Girado"   , "continent": "place"    },
        { "value": "La Libertad", "text": "La Libertad"   , "continent": "place"    }
    ];      

    $scope.iniciativa = new Iniciativa();
    $scope.organization = Usuario.get({
        id: $rootScope.user_id
    }, function(data) {
        $scope.first_time = data.ownedIniciativas && data.ownedIniciativas.length > 1 && data.implementation == 'chascomus' ? false : true;
    });

    $scope.show_organization_form = function() {
        return $scope.first_time && !$scope.persisted;
    };

    $scope.prepareOrganization = function() {
        $scope.organization.implementation = 'chascomus';
        _.extend($scope.organization.networks, {
            facebook: {
                has: $scope.organization.facebook ? true : false,
                user_id: $scope.organization.facebook
            },
            twitter: {
                has: $scope.organization.twitter ? true : false,
                user_id: $scope.organization.twitter
            },
            youtube: {
                has: $scope.organization.youtube ? true : false,
                user_id: $scope.organization.youtube
            }
        });
    };
 

    $scope.prepareModel = function() {
        $scope.iniciativa.implementation = 'chascomus';
        if($scope.iniciativa.name) {
            $scope.iniciativa.slug = $scope.iniciativa.name.replace(/\s+/g, '_');
        }
        $scope.iniciativa.user_id = $scope.organization._id;
        if($scope.first_time && $scope.organization ) {
            //$scope.iniciativa.user_name = $scope.organization.name ;
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

        if($scope.first_time && $scope.organization ) {
            //$scope.iniciativa.owner.name = $scope.organization.name;
        }
        $scope.iniciativa.goal = '';
        $scope.iniciativa.duration = '';
        $scope.iniciativa.participants_amount =  '0';
        $scope.iniciativa.main_category ='arte_cultura';

        $scope.iniciativa.activities = '';
        //$scope.iniciativa.categories = $scope.categories;

    };

    $scope.save = function(isValid) {
        $scope.saving = true;
        $scope.hasError = !isValid;
        $scope.prepareModel();
        if(isValid) {
            $scope.iniciativa.$save(function(data) {
                $scope.saving = false;
                $scope.persisted = true;
            
                $location.hash('page');
                $anchorScroll();
            });
            if($scope.first_time) {
                $scope.prepareOrganization();
                $scope.organization.$save(function(data) {
                    $scope.first_time = false;
                });
            }
        } else {
            $scope.saving = false;

        }
    };


    $scope.doRemove = function() {
        $scope.iniciativa.$remove(function() {
            $location.path('/home');
        });
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

        $('#profile_picture_ngo').fileupload({
            dropZone: $('#dropzone-ngo'),
            dataType: 'json',
            clickable: true,
            url: '/uploads',
            done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                $scope.organization.profile_picture = file.name;
                $('#dropzone-ngo').css('background-image', "url('"+file.thumbnailUrl+"')");
                $('#dropzone-ngo').addClass("with-image");
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

        $('#topics').selectize({
            maxItems: 3,
            selectOnTab: true,
            options: $scope.topicos
        });

    };


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
        topics: []
    };




   $scope.is_new = (typeof($routeParams.id) === 'undefined');

    if(!$scope.is_new) {
        $scope.iniciativa = Iniciativa.get({
            id: $routeParams.id
        }, function(data) {

		if(data.location) {
		    $scope.initial_marker  =  {};
		    $scope.initial_marker['latitude']  = data.location.latitude;
		    $scope.initial_marker['longitude']  = data.location.longitude;
		}

            //$scope.initial_marker  =  data.location;
            $scope.geo = $scope.iniciativa.location;
            $scope.geo.longitude = $scope.iniciativa.longitude;
            $scope.geo.latitude = $scope.iniciativa.latitude;
            $scope.geo.direccion = $scope.iniciativa.address;
            $scope.iniciativa.direccion = $scope.iniciativa.address;
            $scope.geo.locality = $scope.iniciativa.locality;

            if($scope.geo.locality) {
                $scope.geo.locality.country = $scope.iniciativa.country;
                $scope.geo.locality.city = $scope.iniciativa.city;

            }
            $scope.iniciativa.fecha =  moment($scope.iniciativa.start_date).format('DD-MM-YYYY');
            $scope.iniciativa.hour =  moment($scope.iniciativa.start_date).format('hh:mmA');

            $('#hour').val($scope.iniciativa.hour);

            $('#dropzone').css('background-image', "url('/static/uploads/thumbs/"+$scope.iniciativa.profile_picture+"')");
            $('#dropzone').addClass("with-image");
            
            $timeout(function () {
                $scope.setup_components();
            });
        });
    } else {

        $scope.setup_components();
    }

    $location.hash('page');
    $anchorScroll();

}])
.controller('iniciativa-list', ['$scope','$http', 'client', function($scope, $http, client) {

    $scope.iniciativas = [];
    $scope.hits = [];
    $scope.day_filters = [];
    $scope.topics = [];

    $scope.do_search = function() {
        client.search({
            index: 'iniciativas',
            size: 999,
            body: {
                query: {
                    bool: {
                        must: { match: { "implementation": 'chascomus'}},
                    }
                },
                aggs: {
                    topics: {
                        terms: {
                            field: "topics"
                        }
                    },
                    history: {
                        "date_histogram": {
                            "field": "start_date",
                            "interval": "day", 
                            "format": "dd-MM-yyyy" 
                        }
                    }
                },
                facets : {
                    histo1 : {
                        date_histogram: {
                            field: "start_date",
                            interval: "day"
                        }
                    }
                },
                "sort": { "start_date": { "order": "asc" }}
            }
        }).then(function (resp) {

            $scope.hits = resp.hits.hits;
            $scope.day_filters = resp.facets.histo1.entries;
            $scope.topics = resp.aggregations.topics.buckets;
            $scope.iniciativas = resp.hits.hits;
        });


    };

    $scope.do_search();

    $scope.categories = ['medio_ambiente', 'arte_cultura', 'educacion', 'deporte', 'desarrollo', 'bienestar'];

    $scope.split_filters = function(model) {
        var filters = '';
        _.each(model.topics, function(topic) {
            filters = filters + ' '+topic;
        });
        _.each($scope.categories, function(cat) {
            if(model.categories[cat]) {
                filters = filters + ' '+cat;
            }
        });
        return filters;
    };

    $scope.display_category = function(cat) {
        return cat.replace(/_/g, ' ');
    };

    $scope.category_selected = ''; 
    $scope.category_active = '';
    $scope.topic_selected = ''; 
    $scope.topic_active = '';

    $scope.select_category = function(category){
        console.log(category);
        if(category == 'all') {
            $scope.category_selected = ''; 
            $scope.category_active = '';
        } else {
            $scope.category_selected = '.'+category;
            $scope.category_active = category;
        }
        console.log($scope.category_selected+$scope.topic_selected);
        $('.portfolio-isotope').isotope({ filter: $scope.category_selected+$scope.topic_selected});
        return true;
    };

    $scope.isCategoryActive = function(category_key) {
        return (category_key == $scope.category_active ? 'active' : '');
    };

    $scope.select_topic = function(topic){
        console.log(topic);
        if(topic == 'all') {
            $scope.topic_selected = ''; 
            $scope.topic_active = '';
        } else {
            $scope.topic_selected = '.'+topic;
            $scope.topic_active = topic;
        }
        console.log($scope.category_selected+$scope.topic_selected);
        $('.portfolio-isotope').isotope({ filter: $scope.category_selected+$scope.topic_selected});
        return true;
    };

    $scope.isTopicActive = function(topic_key) {
        console.log(topic_key+ ' '+ (topic_key == $scope.topic_active ? 'active' : ''));
        return (topic_key == $scope.topic_active ? 'active' : '');
    };




/*
    $scope.user_default = new google.maps.LatLng(-24.615692,-64.432846);
    var myOptions = {
        zoom: 3,
        center:  $scope.user_default,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    



    $scope.marcar_iniciativas = function() {
        var self = this;
        $scope.markers = [];

        var infowindow = new google.maps.InfoWindow({
            maxWidth: 280
        });

        _.each($scope.iniciativas, function(hit) {
            var model = hit._source;
        
            model['_id'] = hit._id;

            var momento = moment(model.start_date).locale('es'),
                location = model.location,
                marker = new google.maps.Marker({
                    title: model.name,
                    position: new google.maps.LatLng(location.latitude,location.longitude),
                    map: $scope.map
                });

            google.maps.event.addListener(marker, 'click', function() {

                $timeout(function () {
                    var $itemTemplate = $scope.itemTemplate( _.extend({
                          main_category: '',
                          profile_picture: '',
                          address: '',
                          goal: '',
                          current_stage: '',
                          description: '',
                          participants_amount: 0,
                          date_f: momento.fromNow()+' ('+momento.format('DD MMMM')+')'
                    }, model));

                    var $dummy = $('<div/>').append($itemTemplate);

                    infowindow.setContent($dummy.html());
                    infowindow.open($scope.map, marker);
                });
            });
            $scope.markers.push(marker);
        });
    };

*/


}])
.controller('iniciativa-view', ['$scope','$http', '$routeParams', '$location', '$anchorScroll', '$sce', 'Iniciativa', 'Usuario', function($scope, $http, $routeParams, $location, $anchorScroll, $sce, Iniciativa, Usuario) {
    $location.hash('page');
    $anchorScroll();

    $scope.iniciativa = Iniciativa.get({
        id: $routeParams.id
    }, function(data) {
        $scope.organization = Usuario.get({
            id: data.owner.user
        }, function(user_data) {

        });
    });


    $scope.plain = function(text) {
        var processed = angular.fromJson(text);
//        return $sce.trustAsHtml(processed);
        return processed;
    }
}]);

