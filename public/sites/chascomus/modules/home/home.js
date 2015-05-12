angular.module('chascomusApp.home', ['ngRoute','ui.router','ngResource'])

.config(['$routeProvider', '$stateProvider', function($routeProvider, $stateProvider) {
    $routeProvider.when('/home', {
        templateUrl: '/static/sites/chascomus/partials/home/home.html',
        controller: 'HomeController'
    });
}])
.controller('HomeController', ['$scope', '$rootScope', '$http', '$timeout', '$location', 'client', function($scope, $rootScope, $http, $timeout, $location, client) {
    
    $rootScope.page = 'home';
    $scope.login_form_show = false;

    $scope.is_logged = function() {
        return window.user_id;
    };

    $scope.show_login = function() {
        $scope.login_form_show = true;
    };

    //$scope.user_default = new google.maps.LatLng(-34.615692,-58.432846);
    $scope.user_default = new google.maps.LatLng(-24.615692,-64.432846);

    $scope.organizations = [];
    $scope.lap_organizations = [];
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

    $scope.setup_components = function() {

        $scope.itemTemplate = _.template(_.unescape($scope.item_template));
    };


    $scope.item_template = '<div class="initiative" id="project-modal" tabindex="-1" aria-labelledby="project-modal-label" > <div class="_modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> <h4 class="modal-title" id="project-modal-label"><%= name %></h4> </div> <div class="modal-body"> <article class="single-project"> <div class="project-thumbnail"> <div id="project-thumbnail-carousel-1" class="carousel slide" data-ride="carousel"> <div class="carousel-inner"> <div class="item active"> <img src="/static/uploads/thumbs/<%= profile_picture %>"/> </div> </div>  </div> </div>  <div class="row"><ul class="list-unstyled project-info"> <li><span><strong><%= address %></strong></span></li> <li><span><strong><%= date_f %></strong></span></li> </ul> </div> <!--div class="row"> <a href="/iniciativas/<%= _id %>" rel="address:/iniciativa"> <span type="button" class="btn btn-block btn-primary">Participá</button></a></div--> </div> </article> </div> </div> </div>';

    $scope.setup_components();

    $scope.do_search = function() {
        client.search({
            index: 'iniciativas',
            size: 6,
            body: {
                query: {
                    bool: {
                        must: { 
                            match: { 
                                "implementation": 'chascomus'
                            }
                        }
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
        });


    };

    $scope.fetch_organizations = function() {
        client.search({
            index: 'usuarios',
            size: 50,
            body: {
                query: {
                    bool: {
                        must: { 
                            match: { 
                                "implementation": 'chascomus'
                            }
                        }
                    }
                }
            }
        }).then(function (resp) {

            $scope.organizations = _.shuffle(resp.hits.hits);
            $scope.lap_organizations = [];
            var count = 0,
                lap = 0;
            $scope.lap_organizations[lap] = [];
            _.each($scope.organizations, function(model) {
                if(count == 6) {
                    lap = lap + 1;
                    count = 0;
                    $scope.lap_organizations[lap] = [];
                }
                $scope.lap_organizations[lap].push(model);
                count = count + 1;
            
            });

		console.dir($scope.lap_organizations);

        $timeout(function () {
		$('#carousel-organizations').carousel();
        }, 1000);

        });


    };



    $scope.do_search();
    $scope.fetch_organizations();

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

