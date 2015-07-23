angular.module('coperableApp.comunidad', ['ngRoute','ui.router','ngResource'])

.config(['$routeProvider', '$stateProvider', function($routeProvider, $stateProvider) {
    $routeProvider
    .when('/comunidades', {
        templateUrl: '/static/sites/coperable/partials/comunidad/index.html',
        controller: 'comunidad-list'
    })
    .when('/comunidades/:id', {
        templateUrl: '/static/sites/coperable/partials/comunidad/view.html',
        controller: 'comunidad-view'
    });

}])
.controller('comunidad-view', ['$scope', '$rootScope', '$http', '$routeParams', '$timeout', '$location', '$anchorScroll',  'Comunidad', function($scope, $rootScope, $http, $routeParams, $timeout, $location, $anchorScroll,  Comunidad) {

    $rootScope.page = 'comunidad-view';

    $location.hash('page');
    $anchorScroll();

    $scope.iniciativas = [];
    $scope.Comunidad = Comunidad.get({
        id: $routeParams.id
    }, function(data) {
        $scope.comunidad = data.comunidad;
        $scope.iniciativas = data.comunidad.iniciativas;
        $scope.miembros = data.comunidad.members;
        $timeout(function () {
            $scope.marcar_iniciativas();
        });
    });

    $scope.can_edit = function() {
        return $routeParams.id == $rootScope.comunidad_id;
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

    $scope.marcar_iniciativas = function() {
        var self = this;
        $scope.markers = [];

        var infowindow = new google.maps.InfoWindow({
            maxWidth: 280
        });

        if($scope.Comunidad) {

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
.controller('comunidad-list', ['$scope', '$rootScope', '$http', '$routeParams', '$location', '$anchorScroll', '$timeout', '$rootScope', 'Comunidad', function($scope, $rootScope, $http, $routeParams, $location, $anchorScroll, $timeout, $rootScope, Comunidad) {

    $rootScope.page = 'comunidad-list';

    $scope.comunidades = [];

    $scope.setup_components = function() {

    };

    $scope.comunidades = Comunidad.query(function(data) {
        $scope.comunidades = data;

        $timeout(function () {
            $scope.setup_components();
        });
    });


    $location.hash('page');
    $anchorScroll();

}]);

