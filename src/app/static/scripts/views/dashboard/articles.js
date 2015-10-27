/* global tobaco, Backbone, JST, jQuery */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Dashboard = tobaco.Views.Dashboard || {};

(function(tobaco, Backbone, JST, $) {
    'use strict';

    tobaco.Views.Dashboard.Articles = Backbone.View.extend({
        template: JST['app/static/scripts/templates/article.ejs'],

        events: {
            'click .article': 'toggleArticle',
            'click .article .i--short': 'toggleArticle2',
            'click .article .article__content.i--full, .article .article__title.i--full': 'toggleArticle2',
            'click .js-feedback-btn': 'feedback',
            'click .js-share-btn': 'shareBtn',
            'click .share-btn-tooltip': 'shareBtnTooltip',
            'click .reload-btn > a': 'reloadBtn',
            'click .js-article-filter-btn': 'selectFilterItem'
        },

        initialize: function(options) {
            this.isRequestInProgress = false;
            this.dataForNextRequest = null;
            this.dataCurrentlyRequested = null;
            this.currentSkip = 0;
            this.articles = [];

            if (typeof options.currentSearchFor === 'string') {
                this.request(options.currentSearchFor);
            }

            this.scroll();
        },

        request: function(data, append) {
            if (this.isRequestInProgress) {
                if (!append) {
                    this.dataForNextRequest = data;
                }
            } else {
                this.makeRequest(data, append);
            }
        },

        makeRequest: function(data, append) {
            var self = this;

            this.isRequestInProgress = true;

            if (append) {
                this.currentSkip = this.currentSkip + 10;
                data = data + '&s=' + this.currentSkip;
            } else {
                this.currentSkip = 0;
            }

            $.ajax({
                type: 'GET',
                url: '/filter/',
                dataType: 'json',
                data: decodeURI(data),
                success: function(articles) {
                    if (!append) {
                        self.dataCurrentlyRequested = data;
                    }

                    self.isRequestInProgress = false;

                    self.hideLoading();

                    if (self.dataForNextRequest !== null) {
                        var new_data = self.dataForNextRequest;
                        self.dataForNextRequest = null;
                        self.request(new_data);
                    } else {
                        self.render(articles, append);
                        var title = document.title;

                        if (append !== true) {
                            self.articles = [];
                        }

                        Array.prototype.push.apply(self.articles, articles.data);

                        window.history.pushState({data: data, articles: articles}, title, '?' + data);
                    }
                },
                error: function() {
                    self.dataCurrentlyRequestedError = data;
                    self.dataCurrentlyRequestedErrorAppend = append;

                    if (!append) {
                        self.dataCurrentlyRequested = data;
                    }

                    self.isRequestInProgress = false;
                    self.hideLoading();

                    if (self.dataForNextRequest !== null) {
                        var new_data = self.dataForNextRequest;
                        self.dataForNextRequest = null;
                        self.request(new_data);
                    } else {
                        self.showReloadBtn();
                    }
                }
            });
        },

        render: function(articles, append) {
            var html = this.template({articles: articles.data, num_results: articles.num_results});

            if (append) {
                this.$('.more-articles').remove();
                this.$el.append(html);
            } else {
                this.$el.empty()
                    .append('<div class="num_results">' + articles.num_results + ' results' + '</div>')
                    .append(html);
            }
        },

        scroll: function() {
            var $w = $(window);
            var $d = $(document);
            var self = this;
            var timer;

            $w.scroll(function() {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    self.showLoading();
                    if ($w.scrollTop() < $d.height() - $w.height()
                        && $w.scrollTop() >= $d.height() * 0.70 - $w.height()) {
                        if (typeof self.$('.no-more-articles')[0] === 'undefined') {
                            setTimeout(function () {
                                self.request(self.dataCurrentlyRequested, true);
                            }, 150);
                        }
                    } else if ($w.scrollTop() == $d.height() - $w.height()) {
                        if (typeof self.$('.no-more-articles')[0] === 'undefined') {
                            setTimeout(function() {
                                self.request(self.dataCurrentlyRequested, true);
                            }, 750);
                        }
                    }
                }, 50);
            });
        },

        showLoading: function() {
            var width = this.$el.outerWidth(),
                opts = {
                    lines: 11,
                    length: 8,
                    width: 2,
                    radius: 10,
                    corners: 1.0,
                    rotate: 0,
                    trail: 60,
                    speed: 1.0,
                    direction: 1,
                    color: '#fff'
                },
                spinner = new Spinner(opts).spin();

            $(spinner.el).css({
                'position': 'relative',
                'margin-left': width / 2,
                'top': 20
            });

            this.$el.append($(spinner.el));

            this.hideReloadBtn();
        },

        hideLoading: function() {
            this.$el.find('.spinner').remove();
        },

        toggleArticle: function(e) {
            if (window.getSelection().type === 'Range') {
                return false;
            }

            var article = $(e.currentTarget),
                articleId = article.find('.js-feedback-btn').attr('data-uuid');

            if (e.currentTarget == e.target) {
                if (article.hasClass('article--short')) {
                    $.ajax({
                        type: 'GET',
                        url: '/logger/article_opened/?uuid=' + articleId,
                        dataType: 'json'
                    })
                }

                article.toggleClass('article--short');
                article.toggleClass('article--full');
            }
        },

        toggleArticle2: function(e) {
            if (window.getSelection().type === 'Range') {
                return false;
            }

            var article = $(e.currentTarget).parent('article'),
                articleId = article.find('.js-feedback-btn').attr('data-uuid');

            if (article.hasClass('article--short')) {
                $.ajax({
                    type: 'GET',
                    url: '/logger/article_opened/?uuid=' + articleId,
                    dataType: 'json'
                })
            }

            article.toggleClass('article--short');
            article.toggleClass('article--full');
        },

        feedback: function(e) {
            var uuid = $(e.currentTarget).attr('data-uuid'),
                article = {};

            if (uuid !== undefined) {
                for (var i = 0; i < this.articles.length; i++) {
                    if (this.articles[i].uuid === uuid) {
                        article = this.articles[i];
                    }
                }
            }

            this.dialog = new tobaco.Views.Dashboard.FeedbackDialog({article: article});

            this.listenTo(this.dialog, 'closed', function() {
                delete self.dialog;
            });

            return false;
        },

        shareBtn: function(e) {
            //var $el = $(e.target).parent();

            //new tobaco.Views.Dashboard.ShareBtn({el: $el});

            e.preventDefault();
        },

        shareBtnTooltip: function(e) {
            var $el = $(e.currentTarget);

            $el.tooltip({
                items: ".share-btn-tooltip",
                content: "This feature is currently unavailable in alpha release.",
                position: {
                    my: "left+30 center",
                    at: "right center"
                }
            });

            $el.tooltip("open");

            e.preventDefault();
        },

        showReloadBtn: function() {
            this.hideReloadBtn();
            this.$el.append('<p class="reload-btn">An error has occurred. <a href="#">Try again.</a></p>');
        },

        hideReloadBtn: function() {
            this.$('p').remove();
        },

        reloadBtn: function() {
            this.request(this.dataCurrentlyRequestedError, this.dataCurrentlyRequestedErrorAppend);

            return false;
        },

        selectFilterItem: function(e) {
            var $filerItem = $(e.currentTarget),
                id = $filerItem.attr('data-id'),
                filterType = $filerItem.attr('data-filter-item');
            this.trigger('select_filter_item', id, filterType);
            e.stopPropagation();
        }
    });

})(tobaco, Backbone, JST, jQuery);
