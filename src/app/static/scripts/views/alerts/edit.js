/* global tobaco, Backbone, Modernizr, jQuery */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Alerts = tobaco.Views.Alerts || {};

(function(tobaco, Backbone, Modernizr, $) {
    'use strict';

    tobaco.Views.Alerts.Edit = Backbone.View.extend({
        events: {
            'click .select-all.category': 'selectAllCategories',
            'click .select-all.geography': 'selectAllRegions',
            'click .select-all.language': 'selectAllLanguages',
            'click .btn-save-alert.update': 'update',
            'click .btn-save-alert.create': 'create',
            'blur input[name=name]': 'prepareData',
            'blur input[name=terms]': 'prepareData',
            'blur input[name=share]': 'prepareData',
            'click .frequency .checkbox': 'prepareData',
            'click .js-reset': 'reset',
            'click .js-remove': 'removeLine',
            'click .js-add-more': 'addLine',
            'click .alert-share-btn-tooltip': 'alertShareBtnTooltip',
            'click .alert-frequency': 'toggleFrequency'
        },

        initialize: function(options) {
            Modernizr.addTest('csschecked', function() {
                return Modernizr.testStyles('#modernizr input {margin-left:0px;} #modernizr input:checked {margin-left: 20px;}', function(elem) {
                    var chx = document.createElement('input');
                    chx.type = 'checkbox';
                    chx.checked = 'checked';
                    elem.appendChild(chx);

                    return elem.lastChild.offsetLeft >= 20;
                });
            });

            this.filters = new tobaco.Views.Dashboard.Filters({el: this.$('#filters'), options: options});
            this.listenTo(this.filters, 'new_data', this.newFilterData);
        },

        prepareData: function() {
            this.filters.syncPrepareData();
        },

        newFilterData: function(data) {
            this.data = data + '&name=' + escape(this.$el.find('input[name=name]').val())
                + '&frequency=' + escape(this.$el.find('input[name=frequency]:checked').val())
                + '&' + this.$el.find('input[name=share]').serialize();
        },

        selectAllCategories: function() {
            this.filters.selectAllCategories();
        },

        selectAllRegions: function() {
            this.filters.selectAllRegions();
        },

        selectAllLanguages: function() {
            this.filters.selectAllLanguages();
        },

        update: function(e) {
            var id = $(e.currentTarget).attr('data-alert-id');

            $.ajax({
                type: 'POST',
                url: '/alert/' + id + '/',
                data: this.data + '&_method=put',
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        window.location = window.location.origin + '/alerts/';
                    } else {
                        $('.alert-name input').addClass('error');
                        document.location = document.location.origin + document.location.pathname + "#filters";
                    }
                }
            });

            e.preventDefault();
        },

        create: function(e) {
            $.ajax({
                type: 'POST',
                url: '/alert/',
                data: this.data,
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        window.location = window.location.origin + '/alerts/';
                    } else {
                        $('.alert-name input').addClass('error');
                        document.location = document.location.origin + document.location.pathname + "#filters";
                    }
                }
            });

            e.preventDefault();
        },

        reset: function(e) {
            this.$('button.cat').removeClass('active');
            this.$('input[type=checkbox]').prop('checked', false);
            this.$('.alert-name input').val('');
            this.$('.keywords input').val('');

            this.prepareData();

            e.preventDefault();
        },

        addLine: function(e) {
            var btn = $(e.currentTarget);

            btn.parent().append(' <div class="btn btn-default js-remove">- Remove</div>');
            btn.parent().parent().append('<div class="line"> <input name="share" /> <div class="btn btn-default js-add-more">+ Add more</div></div>');
            btn.remove();

            e.preventDefault();
        },

        removeLine: function(e) {
            $(e.currentTarget).parent().remove();

            e.preventDefault();
        },

        alertShareBtnTooltip: function(e) {
            var $el = $(e.currentTarget);

            $el.tooltip({
                items: ".alert-share-btn-tooltip",
                content: "This feature is currently unavailable in alpha release.",
                position: {
                    my: "left+30 center",
                    at: "right center"
                }
            });

            $el.tooltip("open");

            e.preventDefault();
        },

        toggleFrequency: function(e) {
            $(e.currentTarget).find('input[type="radio"]').prop('checked', true);
        }
    });

})(tobaco, Backbone, Modernizr, jQuery);
