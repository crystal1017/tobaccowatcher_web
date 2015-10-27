/* global tobaco, Backbone, jQuery */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Dashboard = tobaco.Views.Dashboard || {};

(function(tobaco, Backbone, JST, $) {
    'use strict';

    tobaco.Views.Dashboard.FeedbackDialog = Backbone.View.extend({
        events: {
            'click .js-not-related-btn': 'toggleNotRelated',
            'click .js-category-incorrect-btn': 'turnOnCategory',
            'click .js-category-cancel-btn': 'turnOffCategory',
            'click .js-language-incorrect-btn': 'turnOnLanguage',
            'click .js-language-cancel-btn': 'turnOffLanguage',
            'click .js-country-incorrect-btn': 'turnOnCountry',
            'click .js-country-cancel-btn': 'turnOffCountry',
            'click .js-region-incorrect-btn': 'turnOnRegion',
            'click .js-region-cancel-btn': 'turnOffRegion',
            'click .js-cancel-btn': 'handleCancel',
            'click .js-submit-btn': 'handleSubmit'
        },

        template: JST['app/static/scripts/templates/feedback.ejs'],

        initialize: function(options) {
            this.article = options.article;

            this.render();
        },

        render: function() {
            var id = 'dialog_feedback_' + this.article.uuid;
            var html = this.template(this.article);

            $('body').append(html);

            this.$el = $('#' + id);

            var self = this;

            $.ajax({
                type: 'GET',
                url: '/feedback-data/',
                dataType: 'json',
                success: function(data) {
                    function append(selector, type) {
                        var select = self.$el.find(selector + ' select');
                        if (type == 'countries') {
                            for (var i in self.article.regions) {
                                data[type].forEach(function(el) {
                                    if (el[2] == self.article.regions[i]) {
                                        select.append(
                                            '<option value="' + el[0] + '">' +
                                            el[1] + '</option>'
                                        );
                                    }
                                });
                            }
                            self.$el.on('change', '.js-region-2-block select', function() {
                                var region = $(this).val(),
                                    countrySelect = self.$el.find('.js-country-2-block select'),
                                    selectData = '<option value="">Select Correct Country</option>';

                                data[type].forEach(function(el) {
                                    if (el[2] == region) {
                                        selectData += '<option value="' + el[0] + '">' + el[1] + '</option>';
                                    }
                                });

                                countrySelect.html(selectData);
                            });
                        } else {
                            data[type].forEach(function(e) {
                                select.append(
                                    '<option value="' + e[0] + '">' +
                                        e[1] + '</option>'
                                );
                            });
                        }

                    }

                    append('.js-category-2-block', 'categories');
                    append('.js-language-2-block', 'languages');
                    append('.js-country-2-block', 'countries');
                    append('.js-region-2-block', 'regions');
                }
            });

            this.showDialog();
        },

        showDialog: function() {
            var self = this;

            self.$el.dialog({
                dialogClass: 'dialog-feedback',
                draggable: false,
                resizable: false,
                show: 'fade',
                title: self.title,
                position: ["bottom", $(window).scrollTop() + 50],
                width: 790,
                height: 580,
                modal: true,
                open: function() {
                    $('.ui-widget-overlay').bind('click', function() {
                        self.$el.dialog('close');
                        self.handleCancel();
                    });
                }
            });
        },

        showThankDialog: function() {
            var self = this;

            self.$el.dialog({
                dialogClass: 'dialog-feedback',
                draggable: false,
                resizable: false,
                hide: 'fade',
                title: self.title,
                width: 420,
                height: 130,
                modal: true,
                open: function() {
                    var time = setTimeout(function() {
                        clearTimeout(time);
                        self.$el.dialog('close');
                        self.handleCancel();
                    }, 2000);

                    $('.ui-widget-overlay').bind('click', function() {
                        self.$el.dialog('close');
                        self.handleCancel();
                    });
                }
            });
        },

        toggleNotRelated: function(e) {
            var btn = $(e.currentTarget);

            btn.toggleClass('btn-red');

            if (btn.hasClass('btn-red')) {
                btn.text(' Not Tobacco Related');
                btn.prepend('<i class="glyphicon glyphicon-ok"></i>');
            } else {
                btn.find('i').remove();
                btn.text(' Not Tobacco Related?');
            }
        },

        turnOnCategory: function() {
            this.$el.find('.js-category-1-block').hide();
            this.$el.find('.js-category-2-block').show();
        },

        turnOffCategory: function() {
            this.$el.find('.js-category-1-block').show();
            this.$el.find('.js-category-2-block').hide()
                .find('select option').removeAttr('selected');
        },

        turnOnLanguage: function() {
            this.$el.find('.js-language-1-block').hide();
            this.$el.find('.js-language-2-block').show();
        },

        turnOffLanguage: function() {
            this.$el.find('.js-language-1-block').show();
            this.$el.find('.js-language-2-block').hide()
                .find('select option').removeAttr('selected');
        },

        turnOnCountry: function() {
            this.$el.find('.js-country-1-block').hide();
            this.$el.find('.js-country-2-block').show();
        },

        turnOffCountry: function() {
            this.$el.find('.js-country-1-block').show();
            this.$el.find('.js-country-2-block').hide()
                .find('select option').removeAttr('selected');
        },

        turnOnRegion: function() {
            this.$el.find('.js-region-1-block').hide();
            this.$el.find('.js-region-2-block').show();
        },

        turnOffRegion: function() {
            this.$el.find('.js-region-1-block').show();
            this.$el.find('.js-region-2-block').hide()
                .find('select option').removeAttr('selected');
        },

        handleCancel: function() {
            this.$el.remove();
            this.trigger('closed');
        },

        handleSubmit: function() {
            var data = {
                uuid: this.article.uuid,
                notrelated: this.$el.find('.js-not-related-btn').hasClass('btn-red'),
                category: this.$el.find('.js-category-2-block select').val(),
                language: this.$el.find('.js-language-2-block select').val(),
                country: this.$el.find('.js-country-2-block select').val(),
                region: this.$el.find('.js-region-2-block select').val(),
                more: this.$el.find('.feedback__tell-more textarea').val()
            };

            $.ajax({
                type: 'POST',
                url: '/feedback/',
                dataType: 'json',
                data: data
            });

            this.$el.dialog('close');

            this.$el.find('.js-first-container').hide();
            this.$el.find('.js-second-container').show();

            this.showThankDialog();
        }
    });

    tobaco.Views.Dashboard.ShareBtn = Backbone.View.extend({
        timeout: null,

        initialize: function() {
            this.$('.share-popup').show();

            var self = this;
            var timeout = null;

            this.$('.share-popup').hover(
                function() {
                    clearTimeout(timeout);
                },

                function() {
                    timeout = setTimeout(self.hide, 500);
                }
            );
        },

        hide: function() {
            this.$('.share-popup').hide();
        }
    });

})(tobaco, Backbone, JST, jQuery);
