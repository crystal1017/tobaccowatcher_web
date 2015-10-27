/* global tobaco, Backbone, jQuery, JST */

tobaco.Views = tobaco.Views || {};

(function(tobaco, Backbone, $) {
    'use strict';

    tobaco.Views.NewsFeed = Backbone.View.extend({
        template: JST['app/static/scripts/templates/newsfeed.ejs'],

        initialize: function() {
            this.$el.addClass('newsticker');

            this.mask = this.$el.wrap('<div class=\'mask\'></div>');
            this.container = this.$el.parent().wrap('<div class=\'tickercontainer\'></div>');

            var containerWidth = this.$el.parent().parent().width() - 5;

            $('li').css({width: containerWidth});

            this.defaultTop = this.$el.position().top;
            this.height = this.$el.height();

            var self = this;
            self.stopAnimation = false;

            this.$el.parent().hover(function() {
                self.stopAnimation = true;
            }, function() {
                self.stopAnimation = false;
                self.startAnimation();
            });

            this.getData();
        },

        getData: function() {
            var self = this;

            $.ajax({
                type: 'POST',
                url: '/newsfeed/',
                dataType: 'json',
                data: '',
                success: function(data) {
                    var articles = data[0];
                    self.render(articles);
                    self.startAnimation();
                }
            });
        },

        render: function(articles) {
            var html = this.template({articles: articles});
            this.$el.append(html);
            this.$el.position({top: -24});
        },

        startAnimation: function() {
            if (this.stopAnimation) {
                return;
            }

            var self = this;
            var $el = this.$el;
            var top = $el.position().top - 24;
            var duration = 500;

            if ($el.position().top <= -238) {
                top = 0;
                duration = 0;
            }

            setTimeout(function() {
                if (self.stopAnimation) {
                    return;
                }

                $el.animate({
                    top: top
                }, {
                    duration: duration,
                    complete: function() {
                        setTimeout(function() {
                            if (self.stopAnimation) {
                                return;
                            }

                            self.startAnimation();
                        }, 100);
                    }
                });
            }, 1950);
        }
    });

})(tobaco, Backbone, jQuery, JST);
