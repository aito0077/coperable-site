/**
 * View for the address widget (views/widgets/address.html).
 */
window.AddressPicker = Backbone.View.extend({

  zoom_default: 12,

  /**
   * id of the DOMElement that will contain the map
   */
  map_canvas: null,
  
  /**
   * The latitude and longitude of the initial marker. For example:
   * {
   *    latitude: 42,
   *    longitude: 42,
   * }
   *
   */
  initial_marker: null,

  /**
   * Default location if initial_marker is null.
   */
  default_location: null,
  /**
   * jQuery element of the addresspicker Map.
   */
  addresspickerMap: null,

  /**
   * jQuery element of the addresspicker text input.
   */
  addresspicker: null,

  events: {

  },

  initialize: function(options) {
    _.bindAll(this, 'setup_binding', 'setup_component');

    if (options.initial_marker && options.initial_marker.latitude && options.initial_marker.longitude) {
      this.initial_marker = options.initial_marker;
    }
    if (options.default_location && options.default_location.latitude && options.default_location.longitude) {
      this.default_location = options.default_location;
    }
    this.map_canvas = options.map_canvas;
    this.setup_component();
    this.setup_binding();
  },

  setup_binding: function() {
    var self = this;
    this.addresspickerMap.on("addressChanged", function(evt, address) {
      try {
        var direccion = address.formatted_address.replace(/Province/g, 'Provincia' );
        self.trigger('direccion_change', direccion);
      } catch(e) {
      }
      self.trigger('location_change', {
        latitud: address.geometry.location.lat(),
        longitud: address.geometry.location.lng()
      });
    });

    this.addresspickerMap.on("positionChanged", function(evt, markerPosition) {
      markerPosition.getAddress( function(address) {
        if (address) {
          $( "#addresspicker_map").val(address.formatted_address);
        }
      })
    });
  },

  setup_component: function() {
    var position = null;
    if (this.initial_marker) {
      position = new google.maps.LatLng(this.initial_marker.latitude,
          this.initial_marker.longitude);
    } else {
      position = new google.maps.LatLng(this.default_location.latitude,
          this.default_location.longitude);
    }
    this.addresspicker = $( "#addresspicker" ).addresspicker();
    this.addresspickerMap = $( "#addresspicker_map" ).addresspicker({
      regionBias: "ar",
      map:      "#map_canvas",
      typeaheaddelay: 1000,
      mapOptions: {
        languaje: "es",
        zoom: 16 || this.zoom_default,
        center: position
      }
    });
    if (this.initial_marker) {
      this.addresspickerMap.addresspicker('reloadPosition');
    }
  }
});
