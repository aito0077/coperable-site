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

        /*
        this.validators.goal = function (value) {
            return value && value.length > 0 ? {isValid: true} : {isValid: false, message: "Tenes que ingresar objetivo "};
        };
        */

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
          current_stage: '',
          participants_amount: 0,
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
    DURATION_FORMAT: 'DD/MM/YYYY HH:mm',
    DEFAULT_LOCATION: {
      latitude: -34.615692,
      longitude: -58.432846
    },
    events: {
      'change #name': 'set_name',
      'change #goal': 'set_goal',
      //'change #description_red': 'set_description',
      'apply.daterangepicker #duration': 'set_duration',
      'keydown #duration': 'prevent_default',
      'change #profile_picture': 'set_profile_picture',
      'slidechange #slider': 'set_participants_amount',
      'change #email': 'set_email',
      'change #activities': 'set_activities',
      'change #topics': 'set_topics',
      'change #addresspicker_map': 'set_address',
      'change #twitter': 'set_network',
      'change #facebook': 'set_network',
      'change #youtube': 'set_network',
      'change #flickr': 'set_network',
      'change #linkedin': 'set_network',
      'change #delicious': 'set_network',
      'click .ini_category': 'set_category',
      'click .comunidad_selector': 'set_comunidad',
      'click #submit_iniciativa': 'create_iniciativa',
      'click #checkbox_participantes': 'set_participantes_ilimitados',
      'click #button_gmap': 'show_gmap'
    },

    initialize: function(options) {
      _.bindAll(this);


      this.current_tab = 'basicos_tab';

      // we set them one by one so we don't send back to the backend more information than needed.
      var iniciativaData = null;
      if (options.iniciativa) {
        iniciativaData = {
          _id: options.iniciativa._id,
          name: options.iniciativa.name,
          goal: options.iniciativa.goal,
          start_date: options.iniciativa.start_date,
          end_date: options.iniciativa.end_date,
          profile_picture: options.iniciativa.profile_picture,
          participants_amount: options.iniciativa.participants_amount,
          email: options.iniciativa.email,
          address: options.iniciativa.address,
          location: options.iniciativa.location,
          categories: options.iniciativa.categories,
          networks: options.iniciativa.networks
        };
      }
      this.model = new iniciativa.Model(iniciativaData);

      this.setup_bindings();
      this.setup_components();
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

      if (this.model.get('profile_picture')) {
        $('#dropzone').css('background-image', "url('/static/uploads/thumbs/"+this.model.get('profile_picture')+"')");
        $('#dropzone').addClass("with-image");
      }
      $('#profile_picture').fileupload({
        dropZone: $('#dropzone'),
        dataType: 'json',
        clickable: true,
        url: '/uploads',
        done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                self.model.set({'profile_picture': file.name});
                $('#dropzone').css('background-image', "url('"+file.thumbnailUrl+"')");
                $('#dropzone').addClass("with-image");
            });
        }
      });

      $('.ini_category').button();

      $('.comunidad_selector').button();

      $('.social-input').each(function() {
        var $input = $(this);
        $input.wrap('<div class="social-input-wrapper"></div>');

        var $wrapper = $input.parent();
          
        $wrapper.prepend('<div class="prefix">'+$input.data('prefix')+'</div>');
        $input.width($wrapper.width()-$wrapper.find('.prefix').width()-10);
        $wrapper.find('.prefix').click(function() {
          $(this).siblings('input').trigger('focus');
        });
      });

      $("#slider").slider({
        min: 1,
        max: 1000,
        step: 1,
        value: this.model.get('participants_amount') || 1,
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
      $("#slider").find('.tooltip').html(this.model.get('participants_amount') || 1);

      $("#activities").tagsInput({
         //autocomplete_url: url_to_autocomplete_api,
         interactive:true,
         width: '600px',
         onChange : this.set_activities,
         removeWithBackspace: true,
         minChars: 3
      });
      $("#topics").tagsInput({
         //autocomplete_url: url_to_autocomplete_api,
         interactive:true,
         width: '600px',
         onChange : this.set_topics,
         removeWithBackspace: true,
         minChars: 3
      });

      var today = moment().hours(0).minutes(0).seconds(0).subtract('days', 1).toDate();

      $('#duration').daterangepicker({
        format: this.DURATION_FORMAT,
        minDate: today,
        timePickerIncrement: 30,
        timePicker12Hour: false,
        timePicker: true,
        startDate: this.model.get('start_date')? moment(this.model.get('start_date')) : undefined,
        endDate: this.model.get('end_date')? moment(this.model.get('end_date')) : undefined,
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

      if (this.model.get('address')) {
        $("#addresspicker_map").val(this.model.get('address'));
      }

      this.address = new AddressPicker({
        initial_arker: this.model.get('location'),
        default_location: this.DEFAULT_LOCATION,
        map_canvas: '#map_canvas'
      });

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
        var self = this;
        var run_save = _.debounce(function() {
            self.save_iniciativa();
        }, 500, true);
        run_save();
    },

    save_iniciativa: function() {

        var self = this;
        this.model.set({
            description: JSON.stringify($('#description_red').getCode())
        });

        if(this.validate()) {
            $('#submit_iniciativa').hide();
            $('#progress').show();
            this.model.save(null, {
                success: function() {

                    self.after_save(self.model.get('_id'));
                },
                error: function() {
                    $('#progress').hide();
                    $("#submit_iniciativa").show();
                }
            });
        }
    },

    after_save: function(id) {
        if(id) {
            try {
                window.location.href = "/iniciativas/success/"+id;
            } catch(err) {

            }
            $("#ref_success").attr("href", "/iniciativas/success/"+id);
        }
        $('#progress').hide();
        $("#btn_success").show();
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

    prevent_default: function(event) {
      event.preventDefault();
      return false;
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

    set_duration: function(e) {
      var date_range_string = e.target.value,
          start_date = null,
          end_date = null;

      if (date_range_string) {
        var date_range = date_range_string.split('-');
        start_date = moment(date_range[0].trim(), this.DURATION_FORMAT).toDate().getTime();
        end_date = moment(date_range[1].trim(), this.DURATION_FORMAT).toDate().getTime();
      }
      this.model.set({
        start_date_timestamp: start_date,
        end_date_timestamp: end_date
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

    set_email: function(e) {
      this.model.set({
        email: e.target.value
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

    set_comunidad: function(e) {
      var value_map = {},
          update_comunidades = [],
          comunidades = this.model.get('comunidades') || [];
      _.each(comunidades, function(com) {
          value_map[com._id] = com;
      });
      value_map[e.target.id] = value_map[e.target.id] ? false : {
        _id: e.target.id,
        name: e.target.name
      };

      _.each(_.keys(value_map), function(name) {
        if(value_map[name]) {
          $('#'+name).addClass('active');
          update_comunidades.push(value_map[name]);
        } else {
          $('#'+name).removeClass('active');
        }
      });

      this.model.set({
        comunidades: update_comunidades
      });


    },



    set_activities: function(e) {
      this.model.set({
        activities: $('#activities').val()
      });
    },
    set_topics: function(e) {
      this.model.set({
        topics: $('#topics').val()
      });
    },
    set_address: function(e) {
      this.model.set({
        address: $(e.target).val()
      });
    },
    set_network: function(event) {
      var networks = this.model.get('networks');
      if (!networks) {
        networks = {};
      }
      var $target = $(event.target);
      var data = {networks: {}};
      networks[$target.attr("id")] = $target.val();
      this.model.set('networks', networks);
    },
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


window.iniciativa.ListManager = Backbone.View.extend({

    el: null,
    $templates: null,

    ARTE_CULTURA: 'arte_cultura',
    DESARROLLO: 'desarrollo',
    EDUCACION: 'educacion',
    MEDIO_AMBIENTE: 'medio_ambiente',

    markers: new Array(),

    events: {
      'click #browser_all': 'browse_iniciativas',
      'click #browser_me': 'browse_iniciativas',
      'click #browser_ac': 'browse_iniciativas',
      'click #browser_ed': 'browse_iniciativas',
      'click #browser_ds': 'browse_iniciativas'
    },

    /**
     * Constructor.
     * @param options.el {jQueryDomElement | string} Element or css selector for the view container.
     * @param options.$template {jQueryDomElement | string} Element or css selector for the templates.
     */
    initialize: function(options) {
      this.el = options.el;
      this.$templates = options.$templates;

      _.bindAll(this, 'traer_iniciativas');

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
      this.itemTemplate = _.template(_.unescape(this.$templates.find(".item-template").html()));

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
    }
  });



})();

// Esta función habría que reemplazarla por una más funcional a los filtros

$(document).ready(function($) {
  var filter_texts = {
      browser_all : '',
      browser_me  : 'Buscamos promover dinámicas, espacios e iniciativas que aporten a la ecología o conciencia de la misma dentro de su propia comunidad: desarrollo y consumo de productos locales, microemprendimientos, cooperativismo, trabajo artesanal, mercados comunales, encuentros culturales, cine debate, iniciativas que mejores y concienticen sobre el medio ambiente como huertas urbanas o compostaje comunitario o talleres sobre ecología.',
      browser_ac  : 'Festivales culturales, Talleres y clases gratuitas. Muestras de arte, Shows y Recitales gratuitos, Ferias municipales, Eventos y actividades en el espacio público, Encuentros abiertos y participativos, Actividades con fines sociales, Convocatorias de espacios a artistas, Actividades en centros culturales, Convocatoria a formar grupos de afinidad sobre temas artístico-culturales.',
      browser_ed  : 'Iniciativas de educación alternativa, Talleres abiertos y gratuitos, internambio de saberes y habilidades, encuentros de aprendizaje horizontal,  espacios de apoyo escolar, formación y capacitación gratuita.',
      browser_ds  : 'Entendemos el desarrollo social como el desarrollo del capital humano y social, reforzando y vínculos y enfocado en el desarrollo comunitario local.<br />Creemos que el desarrollo debe girar en torno a las personas, buscado incentivar y preferenciar el contacto humano cara a cara a través de ambientes favorables tanto al desarrollo del potencial de cada individuo como la convivencia solidaria.'
    }

  $('.ultimas-iniciativas-filtro .category_tab').click(function() {
    $(this).addClass('selected').siblings('.category_tab').removeClass('selected');
    $('.filtro-desc').html(filter_texts[$(this).attr('id')])
  })
});
