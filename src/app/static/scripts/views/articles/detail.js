/* global tobaco, Backbone, jQuery */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Articles = tobaco.Views.Articles || {};

(function(tobaco, Backbone, JST, $) {
    'use strict';

    tobaco.Views.Articles.Detail = Backbone.View.extend({
        template: JST['app/static/scripts/templates/article_detail.ejs'],

        'events': {
            'click .article_tabs_btns span': 'switchCoverage',
            'click .article': 'toggleArticle',
            'click .article .i--short': 'toggleArticle2',
            'click .article .article__content.i--full, .article .article__title.i--full': 'toggleArticle2',
            'click .js-feedback-btn': 'feedback',
            'click .share-btn-tooltip': 'shareBtnTooltip'
        },

        initialize: function() {
            this.additionalSkip = 0;
            this.relatedSkip = 0;
            this.additionalArticles = [];
            this.relatedArticles = [];
            this.article = this.$el.data('info');

            var self = this;

            this.dataForRequest = {
                uuid: self.article.uuid,
                type: $('.articles_tabs:visible').data('type'),
                skip: 0,
                limit: 10
            };

            this.makeRequest({
                uuid: self.article.uuid,
                type: 1,
                skip: 0,
                limit: 10
            }, false);

            this.makeRequest({
                uuid: self.article.uuid,
                type: 0,
                skip: 0,
                limit: 10
            }, false);

            this.scroll();
        },

        makeRequest: function(requestData, append) {
            var self = this;

            if (append) {
                if (requestData.type == 0) {
                    self.additionalSkip += 10;
                } else {
                    self.relatedSkip += 10;
                }
            }

            self.dataForRequest.skip = self.dataForRequest.type == 0 ?
                self.additionalSkip :
                self.relatedSkip;

            $.ajax({
                type: 'GET',
                url: '/ajax/load_articles/',
                dataType: 'json',
                data: requestData,
                success: function(data) {
                    self.hideLoading();

                    if (data.success) {
                        for (var a in data.articles) {
                            if (requestData.type == 0) {
                                self.additionalArticles.push(data.articles[a]);
                            } else {
                                self.relatedArticles.push(data.articles[a]);
                            }
                        }

                        self.render(data.articles, append, requestData.type);
                    }
                }
            });
        },

        render: function(articles, append, dataType) {
            var num = dataType == 0 ?
                this.additionalArticles.length :
                this.relatedArticles.length,
                itemHtml = this.template({articles: articles, num: num});

            var $articlesEl = dataType == 0 ?
                $('.additional_articles') :
                $('.related_articles');

            if (append) {
                $articlesEl.append(itemHtml);
            } else {
                $articlesEl.html(itemHtml);
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
                        self.dataForRequest.type = $('.articles_tabs:visible').data('type');
                        if ($('.articles_tabs[data-type="'+self.dataForRequest.type+'"]').find('.article__error').length == 0) {
                            setTimeout(function() {
                                self.makeRequest(self.dataForRequest, true);
                            }, 50);
                        }
                    } else if ($w.scrollTop() == $d.height() - $w.height()) {
                        self.dataForRequest.type = $('.articles_tabs:visible').data('type');
                        if ($('.articles_tabs[data-type="'+self.dataForRequest.type+'"]').find('.article__error').length == 0) {
                            setTimeout(function() {
                                self.makeRequest(self.dataForRequest, true);
                            }, 750);
                        }
                    }
                }, 50);
            });
        },

        showLoading: function() {
            var $el = $('.articles_tabs_wrap'),
                width = $el.outerWidth(),
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
                'margin-left': width / 2 - 21,
                'top': 45
            }).addClass('article_detail');

            $el.append($(spinner.el));
        },

        hideLoading: function() {
            $('.articles_tabs_wrap').find('.spinner').remove();
        },

        switchCoverage: function(e) {
            var $coverage = $(e.currentTarget),
                $type = $coverage.data('article-type');

            $('.article_tabs_btns span').removeClass('active');
            $coverage.addClass('active');
            $('.articles_tabs').hide();
            $('.' + $type).show();

            e.preventDefault();
        },

        toggleArticle: function(e) {
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
            var uuid = $(e.currentTarget).data('uuid'),
                article = {};

            if (uuid !== undefined) {
                var type = $(e.currentTarget).parents('.articles_tabs').data('type'),
                    currentArticles = type == 0 ?
                        this.additionalArticles :
                        this.relatedArticles;

                for (var i = 0; i < currentArticles.length; i++) {
                    if (currentArticles[i].uuid === uuid) {
                        article = currentArticles[i];
                    }
                }
            } else {
                article = this.article;
            }

            this.dialog = new tobaco.Views.Dashboard.FeedbackDialog({article: article});

            this.listenTo(this.dialog, 'closed', function() {
                delete self.dialog;
            });

            return false;
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
        }
    });

})(tobaco, Backbone, JST, jQuery);
