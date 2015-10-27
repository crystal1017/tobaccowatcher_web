/* global tobaco, Backbone, jQuery, _ */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Home = tobaco.Views.Home || {};

(function(tobaco, Backbone, $, _) {
    'use strict';

    tobaco.Views.Home.Dialog = Backbone.View.extend({
        templateDialog: JST['app/static/scripts/templates/dialog.ejs'],
        templateArticles: JST['app/static/scripts/templates/dialog_articles.ejs'],

        initialize: function(options) {
            this.title = options.title;
            this.regions = options.regions;
            this._event = options.event;

            this.data = 'r=' + options.regions.join('&r=');
            this.url = '/?r=' + options.regions.join('&r=');

            this.getData();
            this.render();
        },

        getData: function() {
            var self = this;

            $.ajax({
                type: 'POST',
                url: '/filter/',
                dataType: 'json',
                data: this.data,
                success: function(articles) {
                    self.renderData(articles);
                }
            });
        },

        render: function() {
            var id = 'dialog_' + this.regions.join('_');
            var html = this.templateDialog({id: id, title: this.title, url: this.url});

            $('body').append(html);

            this.$el = $('#' + id);

            this.showDialog();
        },

        renderData: function(articles) {
            var c = {};

            _.forEach(articles.data, function(a) {
                if (a.countries instanceof Array && a.countries.length > 0) {
                    if (!c.hasOwnProperty(a.countries[0])) {
                        c[a.countries[0]] = [];
                    }

                    c[a.countries[0]].push(a);
                }
            });

            var p = [];

            _.forEach(_.keys(c), function(k) {
                p.push({name: k, articles: c[k]});
            });

            var html = this.templateArticles({url: this.url,
                                              c: p});

            this.$('.feed-container').html(html);
        },

        showDialog: function() {
            var self = this;

            self.$el.dialog({
                dialogClass: 'dialog-over-map',
                draggable: false,
                resizable: false,
                show: 'fade',
                hide: 'fade',
                title: self.title,
                width: 424,
                height: 500,
                modal: true,
                position: {
                    my: 'right-30 center',
                    at: 'center center',
                    of: self._event,
                    collision: 'flip fit',
                    using: function(coords, feedback) {
                        var modal = $(this),
                            className = 'switch-' + feedback.horizontal;

                        modal.css({
                            left: coords.left + 'px',
                            top: coords.top + 'px'
                        }).removeClass(function (index, css) {
                            return (css.match (/\bswitch-\w+/g) || []).join(' ');
                        }).addClass(className);
                    }
                },
                open: function() {
                    $('.ui-widget-overlay').bind('click', function() {
                        self.$el.dialog('close');
                    });
                },
                close: function() {
                    self.$el.remove();
                    self.trigger('closed');
                }
            });
        }
    });
})(tobaco, Backbone, jQuery, _);
