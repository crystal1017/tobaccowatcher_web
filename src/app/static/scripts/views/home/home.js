/* global tobaco, Backbone, jQuery */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Home = tobaco.Views.Home || {};

(function(tobaco, Backbone, $) {
    'use strict';

    tobaco.Views.Home.Home = Backbone.View.extend({
        initialize: function() {
            this.map = new tobaco.Views.Home.Map({el: $('#map')});
            this.alerts = new tobaco.Views.Home.Alerts({el: $('.container[role=document]')});

            this.map.hide();
            this.alerts.show();

            this.listenTo(this.map, 'toggle:map', this.toggleMap);
            this.listenTo(this.alerts, 'toggle:map', this.toggleMap);
        },

        toggleMap: function() {
            if (this.map.isOpen()) {
                this.map.hide();
                this.alerts.show();
            } else {
                this.map.show();
                this.alerts.hide();
            }
        }
    });

})(tobaco, Backbone, jQuery);
