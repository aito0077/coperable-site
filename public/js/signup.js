(function() {
  Backbone.emulateHTTP = true;
  Backbone.emulateJSON = true; 
  window.usuario = {};
  moment.lang('es');

  /**
   * Usuario Model
   */
  window.usuario.Model = Backbone.Model.extend({
    urlRoot : '/api/usuarios',
    idAttribute: "_id",

    initialize: function () {
        this.validators = {};

        this.validators.profile_picture = function (value) {
            return value && value.length > 0 ? {isValid: true} : {isValid: false, message: "Tenes que ingresar imagen"};
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
   * Usuario Collection
   */
  window.usuario.Collection = Backbone.Collection.extend({
    model: usuario.Model,
    url: '/api/usuarios',
    idAttribute: "_id"
  });

  /**
   * Usuario Edit View
   */
  window.usuario.Edit = Backbone.View.extend({
    events: {
        'change #profile_picture_user': 'set_profile_picture',
        'change #first_name': 'set_first_name',
        'change #last_name': 'set_last_name',
        'change #email': 'set_email',
        'change #address': 'set_address',
        'change #username': 'set_username',
        'change #password': 'set_password',
        'change #about': 'set_about',
        'change #confirm': 'set_confirm',
        'click #submit_usuario': 'create_usuario'
    },

    initialize: function(options) {
      _.bindAll(this);

      var usuarioData = null;
      if (options.usuario) {
        usuarioData = {
            _id: options.usuario._id,
            first_name: options.usuario.first_name,
            last_name: options.usuario.last_name,
            email: options.usuario.email,
            address: options.usuario.address,
            username: options.usuario.username,
            password: options.usuario.password,
            profile_picture: options.usuario.profile_picture,
            about: options.usuario.about
        };
      }
        console.dir(usuarioData);
      this.model = new usuario.Model(usuarioData);

      this.setup_bindings();
      this.setup_components();
    },

    setup_bindings: function() {

    },
     
    setup_components: function() {
      var self = this;

      if (this.model.get('profile_picture')) {
        $('#dropzone_user').css('background-image', "url('/static/uploads/thumbs/"+this.model.get('profile_picture')+"')");
        $('#dropzone_user').addClass("with-image");
      }
      $('#profile_picture_user').fileupload({
        dropZone: $('#dropzone_user'),
        dataType: 'json',
        clickable: true,
        url: '/user/uploads',
        done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                self.model.set({'profile_picture': file.name});
                $('#dropzone_user').css('background-image', "url('"+file.thumbnailUrl+"')");
                $('#dropzone_user').addClass("with-image");
            });
        },
        init: function() {
            console.log("Iniciado");
        }
      });

      var today = moment().hours(0).minutes(0).seconds(0).subtract('days', 1).toDate();

      $(document).bind('dragover', function (e) {
          var dropZone = $('#dropzone_user'),
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
  
    create_usuario: function(e) {
      this.save_usuario();
    },

    save_usuario: function() {
      var self = this;
      this.model.set({

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
        if(id) {
           window.location.href = "/";
        }
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

    set_profile_picture: function(e) {
      this.model.set({
        profile_picture: e.target.value
      });
    },

    set_first_name: function(e) {
        this.model.set({
            first_name: e.target.value
        });
    },
    set_last_name: function(e) {
        this.model.set({
            last_name: e.target.value
        });
    },
    set_email: function(e) {
        this.model.set({
            email: e.target.value
        });
    },
    set_address: function(e) {
        this.model.set({
            address: e.target.value
        });
    },
    set_username: function(e) {
        this.model.set({
            username: e.target.value
        });
    },
    set_password: function(e) {
        this.model.set({
            password: e.target.value
        });
    },
    set_confirm: function(e) {
        this.model.set({
            confirm: e.target.value
        });
    },
    set_about: function(e) {
        this.model.set({
            about: e.target.value
        });
    }

  });
  
})();


