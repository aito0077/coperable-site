angular.module('coperableApp.user', ['ngRoute','ui.router','ngResource'])

.config(['$routeProvider', '$stateProvider', function($routeProvider, $stateProvider) {
    $routeProvider
    .when('/users/edit/:id', {
        templateUrl: '/static/sites/coperable/partials/user/edit.html',
        controller: 'user-edit'
    })
    .when('/users/:id', {
        templateUrl: '/static/sites/coperable/partials/user/profile.html',
        controller: 'user-view'
    });

}])
.controller('user-view', ['$scope', '$rootScope', '$http', '$routeParams', '$timeout', '$location', '$anchorScroll',  'Usuario', function($scope, $rootScope, $http, $routeParams, $timeout, $location, $anchorScroll,  Usuario) {

    $rootScope.page = 'user-view';

    $location.hash('page');
    $anchorScroll();

    $scope.iniciativas = [];
    $scope.profile = Usuario.get({
        id: $routeParams.id
    }, function(data) {

    });

    $scope.can_edit = function() {
        return $routeParams.id == $rootScope.user_id;
    };

    /*
    var myOptions = {
        zoom: 13,
        center:  new google.maps.LatLng(-35.559169,-57.9989482),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    */
    var myOptions = {
        zoom: 3,
        center: new google.maps.LatLng(-21.616579,-60.849613),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };


    $scope.map = new google.maps.Map(document.getElementById("map_canvas_owned"), myOptions);

    $scope.fetch_iniciativas_user = function() {

        $http.get('/api/0.1/iniciativa/user/'+$routeParams.id).
            success(function(data, status, headers, config) {
                $scope.iniciativas = data;
                $timeout(function () {
                    $scope.marcar_iniciativas();
                }, 1000);
            }).error(function(data, status, headers, config) {
                console.log(data);
            });

    };

    $scope.fetch_iniciativas_user();

    $scope.marcar_iniciativas = function() {
        var self = this;
        $scope.markers = [];

        var infowindow = new google.maps.InfoWindow({
            maxWidth: 280
        });

        if($scope.profile) {

            _.each($scope.iniciativas, function(model) {
            
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

        }
    };

    $scope.setup_components = function() {
        $scope.itemTemplate = _.template(_.unescape($scope.item_template));
    };


    $scope.item_template = '<div class="initiative" id="project-modal" tabindex="-1" aria-labelledby="project-modal-label" > <div class="_modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> <h4 class="modal-title" id="project-modal-label"><%= name %></h4> </div> <div class="modal-body"> <article class="single-project"> <div class="project-thumbnail"> <div id="project-thumbnail-carousel-1" class="carousel slide" data-ride="carousel"> <div class="carousel-inner"> <div class="item active"> <img src="/static/uploads/thumbs/<%= profile_picture %>"/> </div> </div>  </div> </div>  <div class="row"><ul class="list-unstyled project-info"> <li><span><strong><%= address %></strong></span></li> <li><span><strong><%= date_f %></strong></span></li> </ul> </div> <!--div class="row"> <a href="/iniciativas/<%= _id %>" rel="address:/iniciativa"> <span type="button" class="btn btn-block btn-primary">Participá</button></a></div--> </div> </article> </div> </div> </div>';

    $scope.setup_components();
}])
.controller('user-edit', ['$scope', '$rootScope', '$http', '$routeParams', '$location', '$anchorScroll', '$timeout', '$rootScope', 'Usuario', function($scope, $rootScope, $http, $routeParams, $location, $anchorScroll, $timeout, $rootScope, Usuario) {

    $rootScope.page = 'user-edit';

    $scope.saving = false;
    $scope.hasError = false;
    $scope.persisted = false;

    $scope.prepareModel = function() {
        $scope.organization.implementation = 'coperable';
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
 

    $scope.save = function(isValid) {
        console.log('Is Valid? '+isValid);
        $scope.saving = true;
        $scope.hasError = !isValid;
        $scope.prepareModel();
        if(isValid) {
            $scope.organization.$save(function(data) {
                $scope.first_time = false;
            });
            $location.path('/users/'+$scope.organization._id);
        } else {
            $scope.saving = false;

        }
    };


    $scope.doRemove = function() {
        $scope.User.$remove(function() {
            $location.path('/home');
        });
    };

    $scope.setup_components = function() {

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

        $('#dropzone-ngo').css('background-image', "url('/static/uploads/thumbs/"+$scope.organization.profile_picture+"')");
        $('#dropzone-ngo').addClass("with-image");

    };

    $scope.organization = Usuario.get({
        id: $rootScope.user_id
    }, function(data) {

        if(data.networks) {
            _.each(['youtube', 'facebook', 'twitter'], function(social) {
                if(data.networks[social]) {
                    $scope.organization[social] = data.networks[social].user_id;
                }
            });
        }

        $timeout(function () {
            $scope.setup_components();
        });

    });



    $location.hash('page');
    $anchorScroll();

}]);

