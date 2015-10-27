/* global tobaco, Backbone */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Home = tobaco.Views.Home || {};

(function(tobaco, Backbone) {
    'use strict';


    tobaco.Views.Home.Alerts = Backbone.View.extend({
        events: {
            'click #alerts, .cat-link, a#alerts-btn': 'toggleMap'
        },

        toggleMap: function(e) {
            $('.map-content').fadeOut('slow');
            this.trigger('toggle:map');
            e.preventDefault();
        },

        show: function() {
            this.$('.content').slideDown('slow');
        },

        hide: function() {
            this.$('.content').slideUp('slow');
        }
    });

})(tobaco, Backbone);
