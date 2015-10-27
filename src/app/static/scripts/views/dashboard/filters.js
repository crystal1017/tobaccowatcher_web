/* global tobaco, Backbone, JST, jQuery, _ */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Dashboard = tobaco.Views.Dashboard || {};

(function(tobaco, Backbone, JST, $, _) {
    'use strict';

    tobaco.Views.Dashboard.Filters = Backbone.View.extend({
        events: {
            'click .category-button': 'toggleCategory',
            'click .category-button .only': 'categoryOnly',
            'click .geography .region.checkbox': 'toggleRegion',
            'click .geography .region.checkbox > span': 'activateRegion',
            'click .geography .checkbox .country': 'toggleCountry',
            'click .geography .region .only': 'regionOnly',
            'click .geography .country .only': 'countryOnly',
            'click .language .checkbox': 'toggleLanguage',
            'click .language .only': 'languageOnly',
            'click .popular .checkbox': 'togglePopular',
            'click .clear-all-btn': function() {
                this.clearAll(false);
            },
            'click a.create-alert-btn': 'createAlert'
        },

        template: JST['app/static/scripts/templates/search_item.ejs'],

        initialize: function() {
            var self = this;

            this.terms = $('#search_terms').val();

            $('.geography .js-accordion').accordion({
                active: false,
                collapsible: true,
                heightStyle: 'content',
                event: false
            });

            this.$from_date = $('#from_date').datepicker({
                altField: '#fromDate',
                minDate: '12/01/2012',
                maxDate: 0,
                changeMonth: true,
                changeYear: true,
                onSelect: function(selectedDate) {
                    $('#to_date').datepicker('option', 'minDate', selectedDate);

                    self.asyncPrepareData();

                    return false;
                }
            });

            this.$to_date = $('#to_date').datepicker({
                altField: '#toDate',
                maxDate: 0,
                changeMonth: true,
                changeYear: true,
                defaultDate: 0,
                onSelect: function(selectedDate) {
                    $('#from_date').datepicker('option', 'maxDate', selectedDate);

                    self.asyncPrepareData();

                    return false;
                }
            });

            if (this.$to_date.val() === '') {
                this.$to_date.datepicker('setDate', new Date());
            }

            this.$el.find('.geography .region.checkbox input:checkbox:not(:checked)').each(function() {
                var input = $(this);

                if (input.parent().parent().find('input:checkbox:checked').length > 0) {
                    input
                        .prop('checked', true)
                        .parent()
                        .find('label i')
                        .addClass('glyphicon-minus')
                        .removeClass('glyphicon-ok');
                }
            });

            this.asyncPrepareData();
        },

        setSearchTerms: function(terms) {
            this.terms = terms;
            this.asyncPrepareData();
        },

        setFilterItem: function(id, filterType) {
            $('.' + filterType + ' input[type=checkbox]').prop('checked', false);

            var e = {};

            if (filterType === 'category') {
                e = {
                    currentTarget: $('.' + id + '-mini')
                }
            } else {
                e = {
                    currentTarget: $('#' + filterType + '-' + id).parent()[0]
                };
            }


            switch (filterType) {
                case "language":
                    this.toggleLanguage(e);
                    break;
                case "country":
                    this.toggleCountry(e);
                    break;
                case "region":
                    this.toggleRegion(e);
                    break;
                case "category":
                    this.categoryOnly(e);
                    break;

            }

            this.asyncPrepareData();
        },

        removeSearchTerms: function() {
            this.terms = '';
            this.asyncPrepareData();

            return false;
        },

        toggleCategory: function(e) {
            var categoryBtn = $(e.currentTarget),
                category = $(e.currentTarget).find('.cat-mini'),
                categoryVal = category.find('input').val(),
                categoryDialogEl = $('.cat-info-dialog').find('input[value="'+categoryVal+'"]');

            categoryBtn.toggleClass('active');
            category.toggleClass('active');
            categoryDialogEl.parents('.cat-mini').toggleClass('active');
            categoryDialogEl.parents('.category-button').toggleClass('active');

            if (category.hasClass('active')) {
                category.find('input').prop('checked', true);
                categoryDialogEl.prop('checked', true);
            } else {
                category.find('input').prop('checked', false);
                categoryDialogEl.prop('checked', false);
            }

            this.asyncPrepareData();

            return false;
        },

        categoryOnly: function(e) {
            e.currentTarget = $(e.currentTarget).parent();
            $('.cat-mini').removeClass('active');
            $('.category-button').removeClass('active');
            $('.cat-mini input[type=checkbox]').prop('checked', false);

            return this.toggleCategory(e);
        },

        activateRegion: function(e) {
            var accordion = $(e.currentTarget).parent().parent();

            if (accordion.accordion('option', 'active') === 0) {
                accordion.accordion('option', 'active', false);
            } else {
                accordion.accordion('option', 'active', 0);
            }

            return false;
        },

        toggleRegion: function(e) {
            var region = $(e.currentTarget),
                input = region.find('input'),
                state = !input.prop('checked');

            input
                .parent()
                .parent()
                .find('input[type=checkbox]')
                .prop('checked', state);

            input
                .parent()
                .find('label i')
                .removeClass('glyphicon-minus')
                .addClass('glyphicon-ok');

            this.asyncPrepareData();

            return false;
        },

        regionOnly: function(e) {
            e.currentTarget = $(e.currentTarget).parent().parent();
            this.$('.geography input[type=checkbox]').prop('checked', false);

            return this.toggleRegion(e);
        },

        toggleCountry: function(e) {
            var country = $(e.currentTarget),
                input = country.find('input'),
                state = !input.prop('checked');

            input.prop('checked', state);

            var container = country.parent(),
                total = container.find('input[type=checkbox]').length,
                checked = container.find('input[type=checkbox]:checked').length,
                region = container.parent().find('.region.checkbox input[type=checkbox]');

            if (total === checked) {
                region
                    .prop('checked', true)
                    .parent()
                    .find('label i')
                    .removeClass('glyphicon-minus')
                    .addClass('glyphicon-ok');
            } else if (checked === 0) {
                region
                    .prop('checked', false)
                    .parent()
                    .find('label i')
                    .removeClass('glyphicon-minus')
                    .addClass('glyphicon-ok');
            } else if (total > checked) {
                region
                    .prop('checked', true)
                    .parent()
                    .find('label i')
                    .removeClass('glyphicon-ok')
                    .addClass('glyphicon-minus');
            }

            this.asyncPrepareData();

            return false;
        },

        countryOnly: function(e) {
            e.currentTarget = $(e.currentTarget).parent().parent();
            this.$('.geography input[type=checkbox]').prop('checked', false);

            return this.toggleCountry(e);
        },

        toggleLanguage: function(e) {
            var language = $(e.currentTarget);

            language
                .find('input')
                .prop('checked',
                      !language.find('input').prop('checked'));

            this.asyncPrepareData();

            return false;
        },

        languageOnly: function(e) {
            e.currentTarget = $(e.currentTarget).parent().parent();
            this.$('.language input[type=checkbox]').prop('checked', false);

            return this.toggleLanguage(e);
        },

        togglePopular: function(e) {
            var popular = $(e.currentTarget);

            popular
                .find('input')
                .prop('checked',
                !popular.find('input').prop('checked'));

            this.asyncPrepareData();

            return false;
        },

        reload: function(data) {
            var self = this;

            this.clearAll(true);

            data.split('&').map(function(p) {
                p = p.split('=');

                var param = decodeURIComponent(p[1]),
                    e;

                if (typeof p[0] === 'string' && typeof param === 'string') {
                    e = undefined;

                    switch(p[0]) {
                        case 't':
                        // terms
                        $('#search_terms').val(param);
                        break;

                        case 'c':
                        // categories
                        e = $('input[type=checkbox][name=c][value=' + param + ']');
                        e.prop('checked', true);
                        e.parent().addClass('active');
                        e.parents('.category-button').addClass('active');
                        break;

                        case 'r':
                        // regions
                        e = $('input[type=checkbox][name=r][value=' + param + ']');
                        e.parent()
                            .parent()
                            .find('input')
                            .prop('checked', true);

                        e.parent()
                            .find('label i')
                            .removeClass('glyphicon-minus')
                            .addClass('glyphicon-ok');
                        break;

                        case 'co':
                        // countries
                        e = $('input[type=checkbox][name=co][value=' + param + ']');
                        e.prop('checked', true);
                        break;

                        case 'la':
                        // languages
                        e = $('input[type=checkbox][name=la][value=' + param + ']');

                        e.prop('checked', true);

                        e.parent()
                            .find('label i')
                            .removeClass('glyphicon-minus')
                            .addClass('glyphicon-ok');
                        break;

                        case 'i':
                            // popular
                            e = $('input[type=checkbox][name=i][value=' + param + ']');

                            e.prop('checked', true);

                            e.parent()
                                .find('label i')
                                .removeClass('glyphicon-minus')
                                .addClass('glyphicon-ok');
                            break;

                        case 'st':
                        // start
                        $('#from_date').val(param);
                        break;

                        case 'e':
                        // end
                        $('#to_date').val(param);
                        break;
                    }

                }
            });
        },

        syncPrepareData: function() {
            var data = this.serialize();

            if (typeof this.terms === 'string' && this.terms !== '') {
                data = data + '&t=' + encodeURI(this.terms);
            }

            this.url_data = data;
            this.url = window.location.protocol + '//' + window.location.host + '/?' + data;

            this.trigger('new_data', data);
        },

        asyncPrepareData: function() {
            var self = this;

            setTimeout(function() {
                self.syncPrepareData();
            }, 100);
        },

        serialize: function() {
            var r20 = /%20/g,
            rbracket = /\[\]$/,
            rCRLF = /\r?\n/g,
            rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
            rsubmittable = /^(?:input|select|textarea|keygen)/i,
                manipulation_rcheckableType = /^(?:checkbox|radio)$/i;

            var params = this.$el
                    .map(function() {
                    // Can add propHook for "elements" to filter or add form elements
                    var elements = $.prop(this, "elements");
                    return elements ? $.makeArray(elements) : this;
                })
                .filter(function() {
                    var type = this.type;

                    // Use .is(":disabled") so that fieldset[disabled] works

                    return this.name && !$(this).is(":disabled") &&
                    rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) &&
                    (this.checked || !manipulation_rcheckableType.test(type));
                })
                .map(function(i, elem) {
                    var val = $(this).val();

                    if (elem.name === 'r' || elem.name === 'co') {
                        return null;
                    }

                    return val == null ?
                    null :
                    $.isArray(val) ?
                    $.map(val, function(val) {
                        return {name: elem.name, value: val.replace(rCRLF, "\r\n") };
                    }) :
                    {name: elem.name, value: val.replace(rCRLF, "\r\n") };
                }).get();

            var regions = this.$el.find('.region.checkbox input[type=checkbox]');

            params.push.apply(params, regions.map(function() {
                var region = $(this);

                if (region.is(':checked') && region.parent().find('label i').hasClass('glyphicon-ok')) {
                    return { name: region.attr('name'), value: region.val().replace(rCRLF, "\r\n") };
                } else if (region.is(':checked')) {
                    var countries = region.parent().parent().find('input[type=checkbox].country');

                    return countries.map(function() {
                        var country = $(this);

                        if (country.is(':checked')) {
                            return { name: country.attr('name'), value: country.val().replace(rCRLF, "\r\n") };
                        }

                        return null;
                    }).get();
                }

                return null;
            }).get());

            var paramArray = [],
                uniqueParams = [];

            params.forEach(function(el) {
                if ($.inArray(el['value'], uniqueParams) == -1) {
                    uniqueParams.push(el['value']);
                    paramArray.push({name: el['name'], value: el['value']});
                }
            });

            return $.param(paramArray);
        },

        clearAll: function(justClean) {
            $('div.category-button').removeClass('active');
            $('div.cat-mini').removeClass('active');
            $('input[type=checkbox]').prop('checked', false);
            this.$from_date.datepicker('setDate', null);
            this.$to_date.datepicker('setDate', new Date());
            this.terms = '';

            this.trigger('clear_all');

            if (!justClean) {
                this.asyncPrepareData();
            }
        },

        createAlert: function() {
            window.location = window.location.protocol + '//' + window.location.host + '/alerts/?' + this.url_data;
        },

        selectAllCategories: function() {
            this.$el.find('button.cat').each(function() {
                var category = $(this);

                if (!category.hasClass('active')) {
                    category.find('input').prop('checked', true);
                    category.addClass('active');
                }
            });

            this.asyncPrepareData();
        },

        selectAllRegions: function() {
            this.$el.find('.geography .region.checkbox').each(function() {
                var region = $(this),
                    input = region.find('input');

                input
                    .parent()
                    .parent()
                    .find('input[type=checkbox]')
                    .prop('checked', true);

                input
                    .parent()
                    .find('label i')
                    .removeClass('glyphicon-minus')
                    .addClass('glyphicon-ok');
            });

            this.asyncPrepareData();
        },

        selectAllLanguages: function() {
            this.$el.find('.language .checkbox').each(function() {
                var language = $(this);

                language
                    .find('input')
                    .prop('checked',
                          !language.find('input').prop('checked'));
            });

            this.asyncPrepareData();
        }
    });

})(tobaco, Backbone, JST, jQuery, _);
