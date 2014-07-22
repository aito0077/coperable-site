(function() {
  Backbone.emulateHTTP = true;
  Backbone.emulateJSON = true; 
  window.iniciativa = {};
  moment.lang('es');

  /**
   * Iniciativa Model
   */
  window.iniciativa.Model = Backbone.Model.extend({
    urlRoot : '/api/iniciativas',
    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.name = function (value) {
            return value && value.length > 0 ? {isValid: true} : {isValid: false, message: "Tenes que ingresar nombre"};
        };

        this.validators.goal = function (value) {
            return value && value.length > 0 ? {isValid: true} : {isValid: false, message: "Tenes que ingresar objetivo "};
        };

        this.validators.description = function (value) {
            return value && value.length > 0 ? {isValid: true} : {isValid: false, message: "Tenes que ingresar descripcion"};
        };

        this.validators.profile_picture = function (value) {
            return value && value.length > 0 ? {isValid: true} : {isValid: false, message: "Tenes que ingresar imagen"};
        };

        this.validators.address = function (value) {
            return value && value.length > 0 ? {isValid: true} : {isValid: false, message: "Tenes que ingresar direccion"};
        };
    },

    validateAll: function () {
        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    /**
     * Updates the current_stage of the model, comparing with the current date.
     */
    updateCurrentStage: function () {
      var startDate = this.get('start_date'),
          endDate = this.get('end_date'),
          today = new Date(),
          tomorrow = new Date();
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      tomorrow.setHours(23);
      tomorrow.setMinutes(59);
      tomorrow.setSeconds(59);
      if (moment(startDate).isAfter(tomorrow)) {
        this.set('current_stage', 'PREPARACION');
      } else {
        if (moment(endDate).isBefore(today)) {
          this.set('current_stage', 'FINALIZADO');
        } else {
          this.set('current_stage', 'ACTIVO');
        }
      }
    },

    /**
     * Returns a populated itemTemplate.
     * @returns {jQueryDomElement}
     */
    populateItemTemplate: function (itemTemplate) {
      var momento = moment(this.get('start_date')).lang('es');
      var $itemTemplate = $(itemTemplate(_.extend(
        {
          main_category: '',
          profile_picture: '',
          address: '',
          goal: '',
          date_f: momento.fromNow()+' ('+momento.format('DD MMMM')+')'
        },
        this.toJSON())));
      // this avoids 404 errors provoked by the placeholders
      $itemTemplate.find("img.replace-src").each(function(index, element) {
        $(this).attr("src", $(this).data("src"));
      });

      return $itemTemplate
    }
  });

  /**
   * Iniciativa Collection
   */
  window.iniciativa.Collection = Backbone.Collection.extend({
    model: iniciativa.Model,
    url: '/api/iniciativas',
    idAttribute: "_id"
  });

  /**
   * Iniciativa Edit View
   */
  window.iniciativa.Edit = Backbone.View.extend({
    events: {
      'change #name': 'set_name',
      'change #goal': 'set_goal',
      //'change #description_red': 'set_description',
      'change #date': 'set_date',
      'change #duration': 'set_duration',
      'change #profile_picture': 'set_profile_picture',
      'slidechange #slider': 'set_participants_amount',
      'change #phone': 'set_phone',
      'change #email': 'set_email',
      'change #activities': 'set_activities',
      'change #topic': 'set_topics',
      'click .ini_category': 'set_category',
      'click #submit_iniciativa': 'create_iniciativa',
      'click #submit_iniciativa_tasks': 'add_iniciativa_tasks',
      'shown #tareas_tab': 'set_current_tab',
      'click #checkbox_participantes': 'set_participantes_ilimitados',
      'click #button_gmap': 'show_gmap'
    },

    initialize: function() {
      _.bindAll(this);


      this.current_tab = 'basicos_tab';
      this.model = new iniciativa.Model;

      this.setup_bindings();
      this.setup_components();
    },

    reset: function(options) {
      this.model.set(options);
      this.user_default = new google.maps.LatLng(options.latitud, options.longitud);

       this.address.reset({
         map_canvas: '#map_canvas',
         user_position: this.user_default
       });
    },

    setup_bindings: function() {
      this.model.on('change:latitud', function(model, attribute) {
        $('#latitude').val(model.get('latitud'));
      });

      this.model.on('change:longitud', function(model, attribute) {
        $('#longitude').val(model.get('longitud'));
      });
    },
     
    show_gmap: function(){
      $('#modalGMap').modal('show');
    },

    setup_components: function() {
      var self = this;

      $('#profile_picture').fileupload({
        dropZone: $('#dropzone'),
        dataType: 'json',
        url: '/uploads',
        done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                self.model.set({'profile_picture': file.name});
                $('#dropzone').css('background', "url('"+file.thumbnailUrl+"')");
            });
        }
      });

      $('.ini_category').button();

      $('.social-input').each(function() {
        var $input = $(this);
        $input.wrap('<div class="social-input-wrapper"></div>');

        var $wrapper = $input.parent();
          
        $wrapper.prepend('<div class="prefix">'+$input.data('prefix')+'</div>');
        $input.width($wrapper.width()-$wrapper.find('.prefix').width()-5);
        $wrapper.find('.prefix').click(function() {
          $(this).siblings('input').trigger('focus');
        });
      });

      $("#slider").slider({
        min: 1,
        max: 1000,
        step: 1,
        value: 1,
        orientation: 'horizontal',
        range: 'min',
        slide: function(evt, ui) {
          $(evt.target).find('.tooltip').html(ui.value);
        },
        start: function(evt, ui) {
          $(evt.target).find('.tooltip').show();
        },
        stop: function(evt, ui) {
          $(evt.target).find('.tooltip').hide();
        }
      });

      $("#activities").tagsInput({
         //autocomplete_url: url_to_autocomplete_api,
         interactive:true,
         width: '600px',
         onChange : this.set_activities,
         removeWithBackspace: true,
         minChars: 3
      });
      $("#topic").tagsInput({
         //autocomplete_url: url_to_autocomplete_api,
         interactive:true,
         width: '600px',
         onChange : this.set_topics,
         removeWithBackspace: true,
         minChars: 3
      });
      $('#date_duracion_from').daterangepicker({
        format: 'DD/MM/YYYY HH:mm',
        timePickerIncrement: 30,
        timePicker12Hour: false,
        timePicker: true,
        locale: {
          applyLabel: '',
          cancelLabel: '',
          fromLabel: 'Desde',
          toLabel: 'Hasta',
          weekLabel: 'S',
          customRangeLabel: 'Rango',
          daysOfWeek: moment()._lang._weekdaysMin.slice(),
          monthNames: moment()._lang._monthsShort.slice(),
          firstDay: 0
        }
      });

      $('.calendar-time').prepend('Hora: ');

      $('.calendar-time').prepend('Hora: ');

      $('#description_red').redactor({
        lang: 'es',
        plugins: ['fullscreen'],
        minHeight: 200, 
        imageUpload: '/uploads/'
      });

      $(".btn-group a").click(function() {
        $(this).siblings().removeClass("active");
        $(this).addClass("active");
      });

      $('#iniciativa_wizard').tab('show');

      $('[name="address"]').on('change', function(){
        self.model.set({
          address: $('[name="address"]').val()
        });
      })

      this.$map = $("#address_map");
      this.$map.goMap({
        markers: [{
          latitude: -34.615853,
          longitude: -58.433298,
          draggable: true,
          id: 'addressMarker'
        }],
        zoom: 13,
        disableDoubleClickZoom: true
      });

      this.address = new AddressPicker();

      this.address.on('direccion_change', function(direccion) {
         self.model.set({
           address: direccion
         });
       });

      this.address.on('location_change', function(location) {
        self.model.set({
          latitud: location.latitud,
          longitud: location.longitud,
          location: {
            latitude: location.latitud,
            longitude: location.longitud
          }
        });
      });

      $(document).bind('dragover', function (e) {
          var dropZone = $('#dropzone'),
              timeout = window.dropZoneTimeout;
          if (!timeout) {
              dropZone.addClass('in');
          } else {
              clearTimeout(timeout);
          }
          var found = false,
              node = e.target;
          do {
              if (node === dropZone[0]) {
                  found = true;
                  break;
              }
              node = node.parentNode;
          } while (node != null);
          if (found) {
              dropZone.addClass('hover');
          } else {
              dropZone.removeClass('hover');
          }
          window.dropZoneTimeout = setTimeout(function () {
              window.dropZoneTimeout = null;
              dropZone.removeClass('in hover');
          }, 100);
      });
    },
  
    set_participantes_ilimitados: function(){
	    var checkeado = $('#checkbox_participantes').is(':checked');
	
    	//$('#slider').css('display',(checkeado?'none':'inline'));
      $('#show_amount').css('display',(checkeado?'none':'inline'));
	  },

    create_iniciativa: function(e) {
      this.save_iniciativa();
    },

    save_iniciativa: function() {
      var self = this;
      this.model.set({
        description: JSON.stringify($('#description_red').getCode())
      });

      if(this.validate()) {
        this.model.save(null, 
          {
            success: function() {
                self.after_save(self.model.get('_id'));
            },
            error: function() {
            }
          }
        );
      }
    },

    after_save: function(id) {
        window.location.href = "/iniciativas/success/"+id;
    },

    set_current_tab: function(e) {
      this.current_tab = e.target.id;
    },

    validate: function() {
        var check = this.model.validateAll();

        if (check.isValid === false) {
            //utils.addValidationError(target.id, check.message);
            alert(_.first(_.values(check.messages)));
            return false;
        } else {
            return true;
        }
    },

    add_iniciativa_tasks: function(e) {
      if(this.validate_tasks()) {
        this.save_iniciativa();
      }
    },

    validate_tasks: function() {
      return true;
    },

    set_latitude: function(e) {
      this.model.set({
        latitude: e.target.value
      });
    },

    set_longitude: function(e) {
      this.model.set({
        longitude: e.target.value
      });
    },

    set_name: function(e) {
      var slug = e.target.value.replace(/\s+/g, '_');
      this.model.set({
        name: e.target.value,
        slug: slug.toLowerCase()
      });
      $('#slug').val(slug);
    },

    set_goal: function(e) {
      this.model.set({
        goal: e.target.value
      });
    },

    set_description: function(e) {
      this.model.set({
        description: e.target.value
      });
    },

    set_date: function(e) {
      this.model.set({
        date: e.target.value
      });
    },

    set_duration: function(e) {
      this.model.set({
        duration: e.target.value
      });
    },

    set_profile_picture: function(e) {
      this.model.set({
        profile_picture: e.target.value
      });
    },

    set_participants_amount: function(e, ui) {
      $('#show_amount').html('('+ui.value+')');
      this.model.set({
        participants_amount: ui.value
      });
    },

    set_phone: function(e) {
      this.model.set({
        phone: e.target.value
      });
    },

    set_email: function(e) {
      this.model.set({
        emai: e.target.value
      });
    },

    set_category: function(e) {
      var value_map = this.model.get('categories') || {};
      value_map[e.target.id] = value_map[e.target.id] ? false : true;
        
      this.model.set({
        categories: value_map
      });

      _.each(_.keys(value_map), function(cat) {
        if(value_map[cat]) {
          $('#'+cat).addClass('active');
        } else {
          $('#'+cat).removeClass('active');
        }
      });
    },

    set_activities: function(e) {
      this.model.set({
        activities: $('#activities').val()
      });
    },
    set_topics: function(e) {
      this.model.set({
        topic: $('#topic').val()
      });
    }
  });

  /**
   * TODO Investigate what it does, document and move to util.js or something like that.
   * It doesn't belong here (Matias Niklison 21/07/2014)
   */
  window.AddressPicker = Backbone.View.extend({

    zoom_default: 12,

    events: {

    },

    initialize: function() {
      _.bindAll(this, 'reset', 'setup_binding', 'setup_component');

      this.model = new Backbone.Model;
    },

    reset: function(options) {
      this.map_canvas = options.map_canvas;
      this.user_position = options.user_position;
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
      this.addresspicker = $( "#addresspicker" ).addresspicker();
      this.addresspickerMap = $( "#addresspicker_map" ).addresspicker({
        regionBias: "ar",
        map:      "#map_canvas",
        typeaheaddelay: 1000,
        mapOptions: {
          languaje: "es",
          zoom: 16 || this.zoom_default,
          center: this.user_position
        }
      });
    }
  });

 
  window.iniciativa.OwnerBrowser = Backbone.View.extend({
    el: $('#div_iniciativas_owner'),

    events: {
    },

    initialize: function() {
      _.bindAll(this);

      this.model = new iniciativa.Model;
      this.iniciativas = new iniciativa.Collection;
      this.setup_component();
      this.setup_binding();
    },

    reset: function(options) {
    
    },

    setup_binding: function() {
    },

    setup_component: function() {
      this.iniciativasByOwnerTemplate = _.template([
      	'<div class="iniciativas-list-item-wrapper">',
          '<div class="iniciativas-list-item category-environment stage-<%=current_stage%>" id="iniciativas-list-item-<%= _id %>">',
            '<div class="thumb">',
      	      '<div class="label" id="div_categoria"></div>',
      	      '<div class="iniciativas-list-item-map" style="width: 100%;height: 130px;"></div>',
      	    '</div>',
            '<div class="wrapper">',
      	      '<h4 class="title">',
      	        '<a href="/iniciativas/<%= _id %>"><%= name %></a>',
      	      '</h4>',
      	      '<p class="address ellipsis" data-icon="">Organizador: <%= owner.name %></p>',
      	      '<div class="start-date ellipsis" data-icon="">Creado: <%= creation_date %>',
              '</div>',
              '<p class="address ellipsis" data-icon=""><%= address %></p>',
            '</div>',
            '<ul class="stages wrapper">',
              '<li class="convocatoria actual">Convocatoria<div class="icon"></div></li>',
              '<li class="activando">Activando<div class="icon"></div></li>',
              '<li class="finalizada">Finalizada<div class="icon"></div></li>',
            '</ul>',
            '<div class="actions wrapper">',
              '<a href="/iniciativas/<%= _id %>" rel="/iniciativas/<%= _id %>" class="btn btn-success boton-participar">Participá</a>',
              '<div class="text" id="div_participantes-<%= _id %>"></div>',
            '</div>',
            '<div class="row">',
              '<div style="position:absolute; left:40%" id="div_social_network-<%= _id %>"></div>',
            '</div>',
          '</div>',
        '</div>',
      ].join(''));
    },

    traer_iniciativas: function(userId) {
      var self = this;
      this.iniciativas.fetch({
        data: $.param({
          userId: userId
        }),
        success: function(iniciativas, response, options) {
          self.listar_iniciativas_owner();
        }
      });
    },

    
    listar_iniciativas_owner: function() {
      var self = this;
      _.each(this.iniciativas.models, function(model) {
        $('#div_iniciativas_owner').append(self.iniciativasByOwnerTemplate(_.extend({
            profile_picture: '',
            goal: ''
        }, model.toJSON())));
	      self.geo_localizar_iniciativas(model);
      });
    },
    
    geo_localizar_iniciativas: function(model){
      var $item = $("#iniciativas-list-item-"+model.get('_id'));
      $item.find('.iniciativas-list-item-map').goMap({
        markers: [{
          latitude: model.get('location.latitude'),
          longitude: model.get('location.longitude')
        }],
        navigationControl: false,
        mapTypeControl: false,
        zoom: 13,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        maptype: 'ROADMAP'
      });
      var $date = $item.find('.start-date')
      $date.html(moment($date.html()).lang('es').fromNow());

      //CATEGORIAS
      var categoria=(model.get('categories.arte_cultura')?'Arte y cultura':(model.get('categories.desarrollo')?'Desarrollo':	(model.get('categories.educacion')?'Educacion':(model.get('categories.medio_ambiente')?'Medio ambiente':'Otra categoría'))));
      $("#div_categoria").html(categoria);


      //PARTICIPANTES
  	  var participantes='0';
  	  //{{#pariticipants_amount}} participantes=model.get('pariticipants_amount') {{/pariticipants_amount}}
  	  $("#div_participantes-"+model.get('_id')).html(participantes + ' participantes');
    }
  });
})();
