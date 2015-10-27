/* global tobaco, Backbone, JST, jQuery */

tobaco.Views = tobaco.Views || {};

(function(tobaco, Backbone, JST, $) {
    'use strict';

    tobaco.Views.Registration = Backbone.View.extend({
        events: {
            'submit .registration-form': 'submitForm'
        },

        submitForm: function(e) {
            var $form = $(e.currentTarget),
                self = this,
                $errorsEl = $('.form_mail_errors');

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: location.pathname,
                data: $form.serialize(),
                success: function(data) {
                    if (!data.success) {
                        var errors = '';
                        for (var i in data.errors) {
                            for (var k in data.errors[i]) {
                                errors += ('<div>' + data.errors[i][k] + '</div>');
                            }
                        }
                        $errorsEl.html(errors).show();
                    } else {
                        $errorsEl.hide().empty();
                        self.completeDialog();
                    }
                }
            });

            e.preventDefault();
        },

        completeDialog: function() {
            var $el = $('.reg-success-dialog');
            $el.show().dialog({
                dialogClass: 'dialog-feedback dialog-registration',
                draggable: false,
                resizable: false,
                hide: 'fade',
                title: '',
                width: 420,
                height: 120,
                modal: true,
                open: function() {
                    var time = setTimeout(function() {
                        clearTimeout(time);
                        $el.dialog('close');
                    }, 2000);

                    $('input[type="text"]').val('');

                    $('.ui-widget-overlay').bind('click', function() {
                        $el.dialog('close');
                    });
                }
            });
        }
    });

})(tobaco, Backbone, JST, jQuery);