(function($, window, document, undefined) {
  /**
   * Widget that initializes a map browser, to browse throu the latest iniciativas.
   */
  if(typeof(window.iniciativa) == 'undefined') {
    window.iniciativa = {};
  }

  window.iniciativa.MapBrowser = Backbone.View.extend({

    el: null,
    $templates: null,
    zoom_default: 12,

    markers: new Array(),

    events: {

    },

    /**
     * Constructor.
     * @param options.el {jQueryDomElement | string} Element or css selector for the view container.
     * @param options.$template {jQueryDomElement | string} Element or css selector for the templates.
     */
    initialize: function(options) {
      this.el = options.el;
      this.$templates = options.$templates;

      _.bindAll(this, 'traer_last_iniciativas');

      this.model = new iniciativa.Model;
      this.iniciativas = new iniciativa.Collection;
      this.last_iniciativas = new iniciativa.Collection;
      this.buenos_aires = new google.maps.LatLng(-34.615692,-58.432846);
      this.user_default = this.buenos_aires;
      this.browserSupportGeolocation =  navigator.geolocation ? true : false;

      this.setup_component();
      this.setup_binding();
    },

    reset: function(options) {
      if(options.user_location) {
        this.user_default = new google.maps.LatLng(options.user_location.latitud, options.user_location.longitud);
        this.has_location = true;
        this.user_location = options.user_user_location;
      }
      this.initialLocation = this.user_default;

      this.render_map();    
    },

    setup_binding: function() {
    },

    setup_component: function() {
      this.itemTemplate = _.template(_.unescape(this.$templates.find(".item-template").html()));

      var myOptions = {
        zoom: 12,
        center:  this.user_default,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    },

    traer_iniciativas: function(category) {
      var self = this;

       $.ajax({
            url: '/api/iniciativas/search',
            type: 'POST',
            success: function(response) {
                self.iniciativas = new iniciativa.Collection(response);
                self.marcar_iniciativas();
            },
            error: function(err) {
                console.log(err);
            },
            data: {
                feca: true
            },
            dataType: 'json',
            cache: false
        }, 'json');


    /*

      this.iniciativas.fetch({
        data: $.param({
          category: category
        }),
        success: function(iniciativas, response, options) {
          self.marcar_iniciativas();
        }
      });

    */

    },

    traer_last_iniciativas: function() {
      var self = this;
       $.ajax({
            url: '/api/iniciativas/search',
            type: 'POST',
            success: function(response) {
                self.last_iniciativas = new iniciativa.Collection(response);
                if(!_.isEmpty(self.last_iniciativas.models)) {
                _.each(self.last_iniciativas.models,
                  function(model) {
                    if(model && !_.isEmpty(model)) {
                        var $itemTemplate = model.populateItemTemplate(self.itemTemplate);
                        var $li = $('<li class="initiative"/>').append($itemTemplate);
                        $('#iniciativas_list').append($li);
                    }
                  });
                }

            },
            error: function(err) {
                console.log(err);
            },
            data: {
                feca: true
            },
            dataType: 'json',
            cache: false
        }, 'json');




        /*
      this.last_iniciativas.fetch({
        data: $.param({
            feca: true,
            last: true,
            latitude: this.user_default.lat(),
            longitude: this.user_default.lng()
        }),
        success: function(last_iniciativas, response, options) {
	        if(!_.isEmpty(self.last_iniciativas.models)) {
            _.each(self.last_iniciativas.models,
              function(model) {
                if(model && !_.isEmpty(model)) {
                    var $itemTemplate = model.populateItemTemplate(self.itemTemplate);
                    var $li = $('<li class="initiative"/>').append($itemTemplate);
                    $('#iniciativas_list').append($li);
                }
              }
            );
	        }
        }
      });
        */
    },

    clear_markers: function() {
      _.each(this.markers, function(marker) {
        marker.setMap(null);
      });
      this.markers = new Array();
      //$('#iniciativas_list').html('');
    },

    marcar_iniciativas: function() {
      var self = this;
      this.clear_markers();

      var infowindow = new google.maps.InfoWindow({
        maxWidth: 280
      });

    console.log('marcar_iniciativas');
      _.each(this.iniciativas.models, function(model) {
        var location = model.get('location');
        var marker = new google.maps.Marker({
          title: model.get('name'),
          position: new google.maps.LatLng(location.latitude,location.longitude),
          map: self.map
        });

        google.maps.event.addListener(marker, 'click', function(){
          var $itemTemplate = model.populateItemTemplate(self.itemTemplate);
          var $dummy = $('<div/>').append($itemTemplate);

          infowindow.setContent($dummy.html());
          infowindow.open(self.map, marker);
        });
        self.markers.push(marker);
      });
    },

    render_map: function() {
        this.map.setCenter(this.initialLocation);
        this.traer_iniciativas();
    },

    detect_geolocation: function() {
      if(this.browserSupportGeolocation) {
        try {
          navigator.geolocation.getCurrentPosition(function(position) {
            var initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            $.get(
              '/user/geolocalization/'+initialLocation.lat()+'/'+initialLocation.lng(),
            {},
            function(responseText) {
            });
          },
          function() {
            handleNoGeolocation(browserSupportFlag);
          });
        } catch(positionError) {
        }
      }
    },

    browse_iniciativas: function(e) {
      var category = null;
      $('.category_tab').removeClass('selected');
      $('#'+e.target.id).addClass('selected');
      switch(e.target.id) {
        case 'browser_all':
          category = null;
          break;
        case 'browser_me':
          category = this.MEDIO_AMBIENTE;
          break;
        case 'browser_ac':
          category = this.ARTE_CULTURA;
          break;
        case 'browser_ed':
          category = this.EDUCACION;
          break;
        case 'browser_ds':
          category = this.DESARROLLO;
          break;
        default:
          break;
      }
      this.traer_iniciativas();
    }
  });
})(jQuery, window, document);
