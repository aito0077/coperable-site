angular.module('fronteraApp.iniciativa', ['ngRoute','ui.router','ui.bootstrap','ngResource'])

.config(['$routeProvider', '$stateProvider', function($routeProvider, $stateProvider) {
    $routeProvider
    .when('/iniciativa/edit', {
        templateUrl: '/static/sites/frontera/partials/iniciativa/edit.html',
        controller: 'iniciativa-edit'
    })
    .when('/iniciativa/edit/:id', {
        templateUrl: '/static/sites/frontera/partials/iniciativa/edit.html',
        controller: 'iniciativa-edit'
    })
    .when('/iniciativas', {
        templateUrl: '/static/sites/frontera/partials/iniciativa/list.html',
        controller: 'iniciativa-list'
    })
    .when('/iniciativa/:id', {
        templateUrl: '/static/sites/frontera/partials/iniciativa/view.html',
        controller: 'iniciativa-view'
    });

}])
.controller('iniciativa-edit', ['$scope', '$rootScope', '$http', '$routeParams', '$location', '$anchorScroll', '$timeout', '$rootScope', 'Iniciativa', 'Usuario', function($scope, $rootScope, $http, $routeParams, $location, $anchorScroll, $timeout, $rootScope, Iniciativa, Usuario) {

    $rootScope.page = 'iniciativa-edit';

    $scope.first_time = false;
    $scope.geo = {};
    $scope.saving = false;
    $scope.hasError = false;
    $scope.persisted = false;

    $scope.topicos = [

        { "value": "Urbano"   ,"text": "Urbano"   , "continent": "naturaleza"    },
        { "value": "Rural"   ,"text": "Rural"   , "continent": "naturaleza"    },
        { "value": "Espacio Público"   ,"text": "Espacio Público"   , "continent": "naturaleza"    },
        { "value": "Corta"   ,"text": "Corta"   , "continent": "naturaleza"    },
        { "value": "Permanente"   ,"text": "Permanente"   , "continent": "naturaleza"    },
        { "value": "Argentina"   ,"text": "Argentina"   , "continent": "place"    },
        { "value": "Colombia"   ,"text": "Colombia"   , "continent": "place"    },
        { "value": "Brasil"   ,"text": "Brasil"   , "continent": "place"    },
        { "value": "Bolivia", "text": "Bolivia"   , "continent": "place"    },
        { "value": "Uruguay"   ,"text": "Uruguay"   , "continent": "place"    },
        { "value": "Paraguay"   ,"text": "Paraguay"   , "continent": "place"    },
        { "value": "Chile", "text": "Chile"   , "continent": "place"    },
        { "value": "Perú"   ,"text": "Perú"   , "continent": "place"    },
        { "value": "Ecuador", "text": "Ecuador"   , "continent": "place"    },
        { "value": "Beca", "text": "Beca"   , "continent": "naturaleza"    }
    ];      

    $scope.iniciativa = new Iniciativa();
    $scope.organization = Usuario.get({
        id: $rootScope.user_id
    }, function(data) {
        $scope.first_time = data.ownedIniciativas && data.ownedIniciativas.length >= 1 && data.implementation ? false : true;
    });

    $scope.show_organization_form = function() {
        return $scope.first_time && !$scope.persisted;
    };

    $scope.prepareOrganization = function() {
        $scope.organization.implementation = 'frontera';
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
        $scope.iniciativa.implementation = 'frontera';
        if($scope.iniciativa.name) {
            $scope.iniciativa.slug = $scope.iniciativa.name.replace(/\s+/g, '_');
        }
        $scope.iniciativa.user_id = $scope.organization._id;
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

        if($scope.iniciativa.fecha_hasta && $scope.iniciativa.hour_hasta) {
            $scope.iniciativa.hour_hasta = $('#hour_hasta').val();
            var end_date = $scope.iniciativa.fecha_hasta+" "+$scope.iniciativa.hour_hasta;
            var time_stamp_hasta = moment(end_date, 'DD-MM-YYYY hh:mmA');
            $scope.iniciativa.end_date_timestamp = time_stamp_hasta.toDate().getTime();
            console.log($scope.iniciativa.end_date_timestamp);
        } else {
            console.log('Default: '+$scope.iniciativa.end_date_timestamp);
            $scope.iniciativa.end_date_timestamp = time_stamp.add(1, 'days').toDate().getTime();
        }

        if($scope.organization ) {
            $scope.iniciativa.organization = $scope.organization.organization_name || $scope.organization.username;
        }
        $scope.iniciativa.goal = '';
        $scope.iniciativa.duration = '';
        $scope.iniciativa.participants_amount =  '0';
        $scope.iniciativa.main_category ='arte_cultura';

        $scope.iniciativa.activities = '';

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
            placeholder: 'Día Inicio Evento',
            minYear: 2015,
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
        $("#fecha_hasta" ).dateDropper({
            format: 'd-m-y',
            placeholder: 'Fin Evento',
            minYear: 2015,
            lang: 'es',
            lock: 'from'
        });

        $('#hour').timepicker({
            show2400: true
        });

        $('#hour_hasta').timepicker({
            show2400: true
        });


        var position = null;
        if ($scope.initial_marker) {
            position = new google.maps.LatLng($scope.initial_marker.latitude, $scope.initial_marker.longitude);
        } else {
            //position = new google.maps.LatLng(-34.615692, -58.432846);
	    position = new google.maps.LatLng(-24.615692,-64.432846);
        }
        $scope.addresspicker = $( "#addresspicker" ).addresspicker();
        $scope.addresspickerMap = $( "#addresspicker_map" ).addresspicker({
            regionBias: "ar",
            map:      "#map_canvas",
            typeaheaddelay: 1000,
            mapOptions: {
                languaje: "es",
                zoom: 3,
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
            options: $scope.topicos,
            items: $scope.iniciativa.topics
        });

    };


    $scope.default_values = {
        goal:  '',
        duration:  '',
        participants_amount:   '0',
        main_category: 'arte_cultura',
        categories: {
            residencia: false,
            formacion: false,
            investigacion: false,
            evento: true,
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
            $scope.iniciativa.fecha_hasta =  moment($scope.iniciativa.end_date).format('DD-MM-YYYY');
            $scope.iniciativa.hour_hasta =  moment($scope.iniciativa.end_date).format('hh:mmA');

            $('#hour').val($scope.iniciativa.hour);
            $('#hour_hasta').val($scope.iniciativa.hour_hasta);

            $('#dropzone').css('background-image', "url('/static/uploads/thumbs/"+$scope.iniciativa.profile_picture+"')");
            $('#dropzone').addClass("with-image");

            $('#dropzone-ngo').css('background-image', "url('/static/uploads/thumbs/"+$scope.organization.profile_picture+"')");
            $('#dropzone-ngo').addClass("with-image");

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
.controller('iniciativa-list', ['$scope', '$rootScope', '$http', '$timeout', 'client', function($scope, $rootScope, $http, $timeout, client) {

    $rootScope.page = 'iniciativa-list';

	window.scrollTo(0, 0);


    $scope.iniciativas = [];
    $scope.hits = [];
    $scope.day_filters = [];
    $scope.topics = [];
    $scope.query_terms = '';
    $scope.list_show = true;
    $scope.map_show = true;

    $scope.toggle_map = function() {
        $scope.map_show = !$scope.map_show;
    };

    $scope.toggle_list = function() {
        $scope.list_show = !$scope.list_show;
    };

    $scope.clear_query = function() {
        $scope.query_terms = '';
        $scope.search_action();
    };

    $scope.search_action = function() {
        $scope.hits = [];
        $scope.day_filters = [];
        $scope.topics = [];

        $scope.category_selected = ''; 
        $scope.category_active = '';
        $scope.topic_selected = ''; 
        $scope.topic_active = '';
        $scope.do_search();
    };


    var myOptions = {
        zoom: 3,
        center:  new google.maps.LatLng(-35.559169,-57.9989482),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map_canvas_portfolio"), myOptions);

    $scope.refresh_markers = function() {
        _.each($scope.markers, function(marker) {
            marker.setMap(null);
        });
        $scope.markers = new Array();
    };


    $scope.marcar_iniciativas = function(iniciativas) {
        var iniciativas_map = iniciativas || [];
        $scope.refresh_markers();

        var infowindow = new google.maps.InfoWindow({
            maxWidth: 280
        });


        _.each(iniciativas_map, function(hit) {
            var model = hit._source; 
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

			_id: hit._id,
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


    $scope.item_template = '<div class="initiative" id="project-modal" tabindex="-1" aria-labelledby="project-modal-label" > <div class="_modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> <h4 class="modal-title" id="project-modal-label"><%= name %></h4> </div> <div class="modal-body"> <article class="single-project"> <div class="project-thumbnail"> <div id="project-thumbnail-carousel-1" class="carousel slide" data-ride="carousel"> <div class="carousel-inner"> <div class="item active"> <img src="/static/uploads/thumbs/<%= profile_picture %>"/> </div> </div>  </div> </div>  <div class="row"><ul class="list-unstyled project-info"> <li><span><strong><%= address %></strong></span></li> <li><span><strong><%= date_f %></strong></span></li> </ul> </div> <!--div class="row"> <a href="/iniciativas/<%= _id %>" rel="address:/iniciativa"> <span type="button" class="btn btn-block btn-primary">Participá</button></a></div--> </div> </article> </div> </div> </div>';

    $scope.itemTemplate = _.template(_.unescape($scope.item_template));



    $scope.do_search = function() {
        var query_search = {
            bool: {
                must: {
                    match: { implementation: 'frontera'}
                }
            }
        };
        if($scope.query_terms) {
            query_search = {
                bool: {
                    must: [
                        {
                            match: { implementation: 'frontera'},
                        },
                        {
                            query_string : {
                                query : $scope.query_terms 
                            }
                        }
                    ]
                }
            };
        }

        client.search({
            index: 'iniciativas',
            size: 999,
            body: {
                query: query_search,
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
            $scope.topics = _.filter(resp.aggregations.topics.buckets, function(topic) {
                return topic.key && topic.key.length > 3;
            });
            
            $scope.iniciativas = resp.hits.hits;

            $timeout(function () {
                $scope.marcar_iniciativas($scope.iniciativas);
            }, 1000);

        });


    };

    $scope.do_search();

    $scope.categories = ['residencia', 'formacion', 'investigacion', 'evento'];

    $scope.split_filters = function(model) {
        var filters = '';
        _.each(model.topics, function(topic) {
            filters = filters + ' '+topic.toLowerCase().replace(/_/g, ' ');
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
        if(category == 'all') {
            $scope.category_selected = ''; 
            $scope.category_active = '';
        } else {
            $scope.category_selected = '.'+category;
            $scope.category_active = category;
        }
        $scope.do_arrange();
        return true;
    };

    $scope.isCategoryActive = function(category_key) {
        return (category_key == $scope.category_active ? 'active' : '');
    };

    $scope.select_topic = function(topic){
        if(topic == 'all') {
            $scope.topic_selected = ''; 
            $scope.topic_active = '';
        } else {
            $scope.topic_selected = '.'+topic;
            $scope.topic_active = topic;
        }
        $scope.do_arrange();
        return true;
    };


    $scope.do_arrange = function() {
        $('.portfolio-isotope').isotope({ filter: $scope.category_selected+$scope.topic_selected});
        var iniciativas_id = _.pluck($('.portfolio-isotope').isotope('getFilteredItemElements'), 'id'); 
        var iniciativas = _.filter($scope.iniciativas, function(model) {
            return _.contains(iniciativas_id, model._id);
        });
        
        $scope.marcar_iniciativas(iniciativas);
    };

    $scope.isTopicActive = function(topic_key) {
        return (topic_key == $scope.topic_active ? 'active' : '');
    };


    $timeout(function () {
	$scope.toggle_map();
    }, 1000);


}])
.controller('iniciativa-view', ['$scope', '$rootScope', '$http', '$routeParams', '$location', '$anchorScroll', '$sce', 'Iniciativa', 'Usuario', function($scope, $rootScope, $http, $routeParams, $location, $anchorScroll, $sce, Iniciativa, Usuario) {

    $rootScope.page = 'iniciativa-view';

	/*
    $location.hash('page');
    $anchorScroll();
*/

    $scope.is_logged = function() {
        return $rootScope.user_id ? true : false;
    };

    $scope.is_member = function() {
        return false;
    };

    $scope.is_owner = function() {
        if($scope.iniciativa.owner) {
            return $scope.iniciativa.owner && $rootScope.user_id == $scope.iniciativa.owner.user;
        } else {
            console.log('Sin owner');
        }
    };

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

