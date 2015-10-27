/* global tobaco, Backbone, jQuery */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Home = tobaco.Views.Home || {};

(function(tobaco, Backbone, $) {
    'use strict';

    tobaco.Views.Home.MapInteractive = Backbone.View.extend({
        events: {
            'click > g': 'showDialog'
        },

        showDialog: function(e) {
            var $el = $(e.currentTarget);

            $el.siblings().attr('class', '');
            $el.attr('class', 'active');

            var options = {
                title: $el.attr('title'),
                regions: $el.attr('data-regions').split(' '),
                event: e
            };

            this.dialog = new tobaco.Views.Home.Dialog(options);

            this.listenTo(this.dialog, 'closed', this.dialogClosed);
        },

        dialogClosed: function() {
            this.$el.children().attr('class', '');
            delete this.dialog;
        }
    });
})(tobaco, Backbone, jQuery);
