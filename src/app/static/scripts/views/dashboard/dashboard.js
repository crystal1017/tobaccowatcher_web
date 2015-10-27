/* global tobaco, Backbone, Modernizr */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Dashboard = tobaco.Views.Dashboard || {};

(function(tobaco, Backbone, Modernizr) {
    'use strict';

    tobaco.Views.Dashboard.Dashboard = Backbone.View.extend({
        events: {
            'click .cat-info-tooltip': 'categoryInfoDialog',
            'click .global-loc-tooltip': 'globalLocationInfo',
            'click .search-info-tooltip': 'searchInfoDialog',
            'click .search-advanced': 'showAdvancedSearch'
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

            this.search = new tobaco.Views.Dashboard.Search({el: this.$('#search'), options: options});
            this.filters = new tobaco.Views.Dashboard.Filters({el: this.$('#filters'), options: options});
            this.articles = new tobaco.Views.Dashboard.Articles({el: this.$('#trending'), options: options});

            this.listenTo(this.search, 'new_search_terms', this.newSearchTerms);
            this.listenTo(this.filters, 'new_data', this.newFilterData);
            this.listenTo(this.filters, 'clear_all', this.clearAll);
            this.listenTo(this.articles, 'select_filter_item', this.selectFilterItem);

            var self = this;

            window.onpopstate = function(e) {
                if (e.state) {
                    self.filters.reload(e.state.data);
                    self.articles.dataCurrentlyRequested = e.state.data;
                    self.articles.render(e.state.articles, false);
                }
            };
        },

        newSearchTerms: function(terms) {
            this.filters.setSearchTerms(terms);
        },

        selectFilterItem: function(id, filterType) {
            this.filters.setFilterItem(id, filterType);
        },

        newFilterData: function(data) {
            this.articles.request(data);
        },

        clearAll: function() {
            this.search.clear();
        },

        categoryInfoDialog: function() {
            var $dialog = $('.cat-info-dialog'),
                self = this;

            $dialog.show().dialog({
                title: 'Categories info',
                dialogClass: 'category-info-dialog',
                draggable: false,
                resizable: false,
                width: 790,
                height: 580,
                modal: true,
                open: function() {
                    $(document).on('click', '.ui-widget-overlay', function(){
                        $dialog.dialog('close');
                    });
                    $(document).on('click', '.category-button', function(e){
                        self.toggleCategory(e);
                        $dialog.dialog('close');
                    })
                }
            });
        },

        toggleCategory: function(e) {
            var categoryBtn = $(e.currentTarget),
                category = $(e.currentTarget).find('.cat-mini'),
                categoryVal = category.find('input').val(),
                categoryFilterEl = $('#filters').find('input[value="'+categoryVal+'"]');

            categoryBtn.toggleClass('active');
            category.toggleClass('active');
            categoryFilterEl.parents('.cat-mini').toggleClass('active');
            categoryFilterEl.parents('.category-button').toggleClass('active');

            if (category.hasClass('active')) {
                categoryFilterEl.prop('checked', true);
                category.find('input').prop('checked', true);
            } else {
                categoryFilterEl.prop('checked', false);
                category.find('input').prop('checked', false);
            }

            this.filters.asyncPrepareData();

            e.preventDefault();
        },

        globalLocationInfo: function(e) {
            var $el = $(e.currentTarget);

            $el.tooltip({
                items: ".global-loc-tooltip",
                content: "Restricts articles to those with a global (rather than specific) geographic focus.",
                position: {
                    my: "left+30 center",
                    at: "right center"
                }
            });

            $el.tooltip("open");

            e.preventDefault();
        },

        searchInfoDialog: function(e) {
            var $dialog = $('.search-info-dialog');

            $dialog.show().dialog({
                title: 'Using search',
                dialogClass: 'srch-info-dialog',
                draggable: false,
                resizable: false,
                width: 630,
                top: 100,
                modal: true,
                open: function() {
                    $(document).on('click', '.ui-widget-overlay', function(){
                        $dialog.dialog('close');
                    });
                }
            });
        },

        showAdvancedSearch: function(e) {
            var $dialog = $('.search-advanced__dialog');

            $(document).off('.search-dialog');

            $dialog.show().dialog({
                dialogClass: 'srch-advanced-dialog',
                draggable: false,
                resizable: false,
                width: 650,
                top: 100,
                modal: true,
                open: function() {
                    $('.ui-widget-overlay').css({
                        opacity: 0.6,
                        backgroundColor: 'rgb(47, 79, 79)'
                    });

                    $(document)
                        .on('click.search-dialog', '.ui-widget-overlay, .search-advanced__close', function(){
                            $dialog.dialog('close');
                        })
                        .on('click.search-dialog', '.srch-advanced-dialog button[type=reset]', function() {
                            this.searchAdvancedDialogReset();
                        }.bind(this))
                        .on('submit.search-dialog', '.srch-advanced-dialog form', function(event) {
                            return this.searchAdvancedDialogSubmit(event);
                        }.bind(this));
                }.bind(this)
            });
        },

        searchAdvancedDialogReset: function(e) {
            $('.search-advanced__dialog').dialog('close');
        },

        searchAdvancedDialogSubmit: function(e) {
            var $form = $('.srch-advanced-dialog form');

            var isExist = function(item) {
                return !!item;
            };

            var keywords = $form.find('input[name=keywords]').val();

            if ($form.find('input[name=phrase]').val()) {
                var phrase = '"' + $form.find('input[name=phrase]').val() + '"';
            }

            var any_words = $form.find('input[name=any_words]').val().split(' ').filter(isExist).join(' OR ');

            var none_words = $form.find('input[name=none_words]').val().split(' ').filter(isExist).map(function(item) {
                return '-' + item;
            }).join(' ');

            var with_begin = $form.find('input[name=with_begin]').val().split(' ').filter(isExist).map(function(item) {
                return item + '*';
            }).join(' ');

            var lang;
            if ($form.find('input[name=language]:checked').val() === 'en') {
                lang = 'lang:en'
            } else {
                lang = 'lang:source'
            }

            if ($form.find('input[name=section]:checked').val()) {
                var section = 'section:' + $form.find('input[name=section]:checked').val();
            }

            var query = [keywords, phrase, any_words, none_words, with_begin, lang, section].filter(isExist).join(' ');

            $('input#search_terms').val(query);
            this.search.updateFilters();

            this.searchAdvancedDialogReset();

            return false;
        }
    });

})(tobaco, Backbone, Modernizr);
