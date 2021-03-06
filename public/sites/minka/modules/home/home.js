angular.module('minkaApp.home', ['ngRoute','ui.router','ngResource'])

.config(['$routeProvider', '$stateProvider', function($routeProvider, $stateProvider) {
    $routeProvider.when('/home', {
        templateUrl: '/static/sites/minka/partials/home/home.html',
        controller: 'HomeController'
    });
}])
.controller('HomeController', ['$scope','$http', '$timeout', '$location', 'client', function($scope, $http, $timeout, $location, client) {
    
    $scope.login_form_show = false;

    $scope.is_logged = function() {
        return window.user_id;
    };

    $scope.show_login = function() {
        $scope.login_form_show = true;
    };

    //$scope.user_default = new google.maps.LatLng(-34.615692,-58.432846);
    $scope.user_default = new google.maps.LatLng(-24.615692,-64.432846);

    $scope.iniciativas = [];
    $scope.hits = [];
    $scope.day_filters = [];
    $scope.countries = [];

    $scope.selected = {};
    $scope.select = function(hit) {
        $scope.selected = hit._source;
    };

    $scope.fetch_iniciativas = function() {
        var data_query = $.param({

        });

        $http.get('/api/iniciativas?'+data_query).
            success(function(data, status, headers, config) {
                $scope.iniciativas = data;
                $scope.marcar_iniciativas();
            }).error(function(data, status, headers, config) {
                console.log(data);
            });

    };



    //$scope.fetch_iniciativas();

    var myOptions = {
        zoom: 3,
        center:  $scope.user_default,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    

    $scope.marcar_iniciativas = function() {
        var self = this;
        //this.clear_markers();
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

    $scope.day_selected = '';
    $scope.country_selected = '';

    $scope.$watch('hits', function() {
        if($scope.hits && $scope.hits.length > 0) {
            $timeout(function () {
                $('.agenda-isotope').isotope({
                    itemSelector : '.agenda-item',
                    resizable: true,
                    resizesContainer: true 
                });

            });
        }
    });

    $scope.select_day = function(day){
        if(day == 'all') {
            $scope.day_selected = ''; 
            $scope.day_active = '';
        } else {
            //$scope.day_selected = ".day"+moment(day).format('DD');
            //$scope.day_selected = ".day"+moment(day).add(2, 'hour').format('DD');
            $scope.day_selected = ".day"+moment(day).add(3, 'hour').format('DD');
            //$scope.day_selected = ".day"+moment(day).format('DD');
            $scope.day_active = day;
        }
        $('.agenda-isotope').isotope({ filter: $scope.day_selected+$scope.country_selected});
        return true;
    };

    $scope.select_country = function(country){
        if(country == 'all') {
            $scope.country_selected = ''; 
            $scope.country_active = '';
        } else {
            $scope.country_selected = '.'+country;
            $scope.country_active = country;
        }
        $('.agenda-isotope').isotope({ filter: $scope.day_selected+$scope.country_selected});
        return true;
    };

    $scope.isCountryActive = function(country_key) {
        return (country_key == $scope.country_active ? 'active' : '');
    };

    $scope.isDayActive = function(day_selected) {
        return (day_selected.time == $scope.day_active ? 'active' : '');
    };
     
    $scope.setup_components = function() {

        $scope.itemTemplate = _.template(_.unescape($scope.item_template));
    };


    $scope.item_template = '<div class="initiative" id="project-modal" tabindex="-1" aria-labelledby="project-modal-label" > <div class="_modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> <h4 class="modal-title" id="project-modal-label"><%= name %></h4> </div> <div class="modal-body"> <article class="single-project"> <div class="project-thumbnail"> <div id="project-thumbnail-carousel-1" class="carousel slide" data-ride="carousel"> <div class="carousel-inner"> <div class="item active"> <img src="/static/uploads/thumbs/<%= profile_picture %>"/> </div> </div>  </div> </div>  <div class="row"><ul class="list-unstyled project-info"> <li><span><strong><%= address %></strong></span></li> <li><span><strong><%= date_f %></strong></span></li> </ul> </div> <!--div class="row"> <a href="/iniciativas/<%= _id %>" rel="address:/iniciativa"> <span type="button" class="btn btn-block btn-primary">Participá</button></a></div--> </div> </article> </div> </div> </div>';

    $scope.setup_components();



    $scope.do_search = function() {
        client.search({
            index: 'iniciativas',
            size: 150,
            body: {
                query: {
                    bool: {
                        must: { match: { "minka": true}},
                    }
                },
                aggs: {
                    countries: {
                        terms: {
                            field: "country"
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
            $scope.countries = resp.aggregations.countries.buckets;
            $scope.iniciativas = resp.hits.hits;
            $scope.marcar_iniciativas();

        });


    };

	//if(window.bleeding) {
	    $scope.do_search();
	//}

    $scope.edit = function() {
        $('#project-modal').modal('hide');
        $timeout(function () {
            $location.path('/iniciativa/edit/'+$scope.selected._id);
        }, 1000);
        return false;
    };

    $scope.class_name = function() {
        return window.bleeding;
    };

}]);

