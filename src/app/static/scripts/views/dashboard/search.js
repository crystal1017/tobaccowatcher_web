/* global tobaco, Backbone */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Dashboard = tobaco.Views.Dashboard || {};

(function(tobaco, Backbone) {
    'use strict';

    tobaco.Views.Dashboard.Search = Backbone.View.extend({
        events: {
            'submit #search_form': 'updateFilters'
        },

        initialize: function() {
            this.input = this.$('input');
            this.old_val = '';
        },

        updateFilters: function(e) {
            var val = this.input.val().replace(/^\s*/, '').replace(/\s*$/, '');

            if (val === '' && this.old_val === '' || val === this.old_val) {
                e && e.preventDefault();
                return;
            }

            this.trigger('new_search_terms', val);
            this.input.val(val);
            this.old_val = val;

            e && e.preventDefault();
        },

        clear: function() {
            this.input.val('');
        }
    });

})(tobaco, Backbone);
