/* global tobaco, Backbone, Modernizr, jQuery */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Home = tobaco.Views.Home || {};

(function(tobaco, Backbone, Modernizr, $) {
    'use strict';

    tobaco.Views.Home.Map = Backbone.View.extend({
        events: {
            'click .explore-map': 'hideOverlay',
            'click #map-content-overlay': 'hideOverlay'
        },

        initialize: function() {
            Modernizr.load({
                test: Modernizr.svg,
                nope: '/static/images/map.png',
                callback: function(url) {
                    $('#map-svg').replaceWith('<img id="map-png" src="' + url + '">');
                }
            });

            this.mapInteractive = new tobaco.Views.Home.MapInteractive({el: $('#map-svg')});

            var self = this;

            $('.explore-map-header').click(function(e) {self.hideOverlay(e);});
        },

        hideOverlay: function(e) {
            this.$('.map-content').fadeOut('slow');

            this.trigger('toggle:map');
            e.preventDefault();
        },

        isOpen: function() {
            return !this.$el.hasClass('closed');
        },

        show: function() {
            if (Modernizr.csstransitions) {
                this.$el.removeClass('closed');
            } else {
                this.$el.animate({height: '666px'}, 800).removeClass('closed');
            }
        },

        hide: function() {
            if (Modernizr.csstransitions) {
                this.$el.addClass('closed');
            } else {
                this.$el.animate({height: '310px'}, 800).addClass('closed');
            }
        }
    });

})(tobaco, Backbone, Modernizr, jQuery);
