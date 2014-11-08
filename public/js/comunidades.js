(function() {
  Backbone.emulateHTTP = true;
  Backbone.emulateJSON = true; 
  window.comunidad = {};
  moment.lang('es');

   
window.comunidad.ListManager = Backbone.View.extend({

    el: null,
    $templates: null,

    markers: new Array(),

    events: {
      'click .iniciativas-bt': 'show_iniciativas',
      'click .organizadores-bt': 'show_organizadores',
      'click .grid-bt': 'show_grid',
      'click .map-bt': 'show_map'
    },

    initialize: function(options) {
      this.el = options.el;
      //_.bindAll(this);

      this.setup_component();
      this.setup_binding();

    },

    reset: function(options) {

    },

    setup_binding: function() {

    },

    setup_component: function() {

    },
    
    show_iniciativas: function(e) {
        $(e.target).addClass('selected').siblings('.organizadores-bt').removeClass('selected');
        $('.iniciativas-ul').show();
        $('.organizadores-ul').hide();
    },

    show_organizadores: function(e) {
        $(e.target).addClass('selected').siblings('.iniciativas-bt').removeClass('selected');
        $('.organizadores-ul').show();
        $('.iniciativas-ul').hide();
    },

    show_grid: function(e) {
        $(e.target).addClass('selected').siblings('.map-bt').removeClass('selected');
        $('#communityLists').show();
        $('#communityMap').hide();
    },

    show_map: function(e) {
        $(e.target).addClass('selected').siblings('.grid-bt').removeClass('selected');
        $('#communityLists').hide();
        $('#communityMap').show();
    }
  });



})();

