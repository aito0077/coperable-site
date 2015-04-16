(function() {

window.SearchController = Backbone.View.extend({

    el: null,
    $templates: null,

    markers: new Array(),

    events: {
      'change #search_text': 'do_search',
      'click .filter-options li span': 'set_sub_filter'
    },

    initialize: function(options) {
      this.el = options.el;
      this.$templates = options.$templates;

      _.bindAll(this, 'do_search');

      this.model = new iniciativa.Model;
      this.iniciativas = new iniciativa.Collection;

      this.setup_component();
      this.setup_binding();

    },

    reset: function(options) {

    },

    set_sub_filter: function(e) {
        var sub_filter_value = $(e.target.parentNode).data('option'),
            main_filter_value = $(e.target.parentNode.parentNode).data('filter-name');
        this.do_search_by_filters(main_filter_value, sub_filter_value);
    },

    do_search:  function() {
        var self = this;
        $.ajax({
            url: '/api/search/iniciativas',
            type: 'GET',
            success: function(response) {
                var results = response.hits;
                $('.list').html('');
                var total = results.total;
                
                _.each(results.hits, function(hit) {
                    var model = new iniciativa.Model(_.extend({description: ''}, hit._source, {_id: hit._id}));
                    if(model && !_.isEmpty(model)) {
                        var $itemTemplate = model.populateItemTemplate(self.itemTemplate);
                        $('.list').append($itemTemplate);
                    }
                });
            },
            data: {
                q: $('#search_text').val()
            },
            error: function() {

            },
            dataType: 'json',
            cache: false,
            contentType: false
        }, 'json');


    },

    do_search_by_filters:  function(term, value) {
        var terms_map = {
            'com': 'comunidades.name',
            'cat': 'main_category',
            'tag': 'topics',
            'date': 'start_date'
        };
        var self = this;
        $.ajax({
            url: '/api/search/term/iniciativas',
            type: 'GET',
            success: function(response) {
                var results = response.hits;
                $('.list').html('');
                var total = results.total;
                
                _.each(results.hits, function(hit) {
                    var model = new iniciativa.Model(_.extend({description: ' '}, hit._source, {_id: hit._id}));
                    if(model && !_.isEmpty(model)) {
                        var $itemTemplate = model.populateItemTemplate(self.itemTemplate);
                        $('.list').append($itemTemplate);
                    }
                });
            },
            data: {
                term: terms_map[term],
                value: value
                /*
                filters: {
                    category: self.filters['category'],
                    date: self.filters['date'],
                    comunidad: self.filters['comunidad'],
                    tag: self.filters['tag']
                }
                */
            },
            error: function() {

            },
            dataType: 'json',
            cache: false,
            contentType: false
        }, 'json');


    },



    setup_binding: function() {

    },

    setup_component: function() {
      this.itemTemplate = _.template(_.unescape(this.$templates.find(".result-item-iniciativa").html()));

    },

    traer_iniciativas: function(category) {
      var self = this;
      this.iniciativas.fetch({
        data: $.param({
          category: category
        }),
        success: function(iniciativas, response, options) {
	        if(!_.isEmpty(iniciativas.models)) {
            
            $('#iniciativas-list').html('');
            _.each(iniciativas.models,
              function(model) {
                if(model && !_.isEmpty(model)) {
                    var $itemTemplate = model.populateItemTemplate(self.itemTemplate);
                    $('#iniciativas-list').append($itemTemplate);
                }
              }
            );
	        }
          }
        });
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
      this.traer_iniciativas(category);
    },

    clear_markers: function() {
      _.each(this.markers, function(marker) {
        marker.setMap(null);
      });
      this.markers = new Array();
    },

    marcar_iniciativas: function() {
      var self = this;
      this.clear_markers();

      var infowindow = new google.maps.InfoWindow({
        maxWidth: 280
      });

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
        this.traer_iniciativas('all');
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
      this.traer_iniciativas(category);
    }
});

    
var search_manager = new SearchController({
    el: $('#search_controller'),
    $templates: $('#templates')
});

})(jQuery, window, document);

