/* global tobaco, Backbone, jQuery */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Trends = tobaco.Views.Trends || {};

(function(tobaco, Backbone, $) {
    'use strict';

    tobaco.Views.Trends.Control = Backbone.View.extend({
        events: {
            'click div i.glyphicon-remove': 'remove',
            'click button': 'calculate'
        },

        initialize: function(options) {},

        remove: function() {
            this.trigger('remove');
        },

        calculate: function(e) {
            if (e) {
                e.preventDefault();
            }

            var data = this.$('form').serialize() + '&' + this.$('form select[name=r]').serialize().replace('r=', 'co=');

            this.trigger('calculate', data);
        },

        showLoading: function() {
            var $body = $('body');
            var height = $body.height();
            var width = $body.width();
            var position = $body.position();
            var opts = {
                lines: 9,
                length: 20,
                width: 7,
                radius: 19,
                corners: 1.0,
                rotate: 0,
                trail: 60,
                speed: 1.0,
                direction: 1,
                color: '#fff'
            };
            var spinner = new Spinner(opts).spin();

            $body.append('<div id=\'overlay\'></div>');

            var $overlay = $('#overlay');
            $overlay.height(height + 7)
                    .css({
                        'top': position.top - 7,
                        'left': position.left,
                        '-ms-filter': 'progid:DXImageTransform.Microsoft.Alpha(Opacity=70)',
                        'filter': 'alpha(opacity=70)',
                        'opacity': 0.7,
                        'position': 'absolute',
                        'background-color': 'black',
                        'width': width,
                        'z-index': 5000
                    });

            $overlay[0].appendChild(spinner.el);
            $overlay.find('.spinner').css({
                'position': 'fixed',
                'margin-left': width/2,
                'margin-top': $(window).height()/2
            });
        },

        hideLoading: function() {
            $('#overlay').remove();
        }
    });

})(tobaco, Backbone, jQuery);
