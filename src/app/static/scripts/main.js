/* global tobaco, jQuery, Modernizr */

window.tobaco = {
    Models: {},
    Collections: {},
    Views: {
        Home: {},
        Dashboard: {}
    },
    Routers: {},
    init: function($) {
        'use strict';

        if ($('#news-ticker')[0]) {
            this.newsfeed = new this.Views.NewsFeed({el: $('#news-ticker')});
        }

        var options = {};

        if ($('body.home')[0]) {

            this.App = new this.Views.Home.Home({el: $('body.home'), options: options});

        } else if ($('body.about')[0]) {
            var $window = $(window),
                $stickyEl = $('.navbar-page'),
                elTop = $stickyEl.offset().top - 36;

            $window.scroll(function () {
                $stickyEl.toggleClass('sticky', $window.scrollTop() > elTop);
            });
        } else if($('#dashboard')[0]) {
            var url = document.createElement('a').href = window.location;

            options.currentSearchFor = url.search.slice(1);

            this.App = new this.Views.Dashboard.Dashboard({el: $('#dashboard'), options: options});
        } else if ($('#js-alerts-list')[0]) {
            this.App = new this.Views.Alerts.List({el: $('body')});
        } else if ($('#alerts-edit')[0]) {
            this.App = new this.Views.Alerts.Edit({el: $('#alerts-edit')});
        } else if ($('#tobacco-analyses')[0]) {
            this.App = new this.Views.Trends.Trends({el: $('#tobacco-analyses')});
        } else if ($('#article-detail')[0]) {
            this.App = new this.Views.Articles.Detail({el: $('#article-detail')});
        } else if ($('#registration')[0]) {
            this.App = new this.Views.Registration({el: $('#registration')});
        }
    }
};

$(document).ready(function() {
    'use strict';

    var body = $("body");

    $('[data-toggle="tooltip"]').tooltip(
        {
            position: {
                my: 'left+0 center',
                at: 'right center'
            }
        }
    );

    $(".share-selectize").change(function() {
      $('.comment-row').slideDown();
    });


    $('.single-alert-box li').each(function() { 
        var $this = $(this);
        var numOfElems = $this.find('i').length;
        if (numOfElems > 1) {
            $this.append("<i class='num'> +" + (numOfElems - 1) + "</i>");
            $this.find('i:first-child').addClass('visible');
        } else {
            $this.children('.help-tooltip').hide();
        }
    });

    $('.single-alert-box li.categories').each(function() { 
        var $this = $(this);
        var numOfElems = $this.find('i').length;
        if (numOfElems > 1) {
            $this.addClass('multiple');
        }
    });

    var remodalInst = $('[data-remodal-id=alert]').remodal({
        closeOnConfirm: false
    });

    var unsaved = false;
    $("#filters input").change(function(){ 
        unsaved = true;
    });
    $(document).on('cancellation', '.remodal', function () {
        var confBox = $('#confirmation-box');
        if (unsaved) {
            remodalInst.settings = {
                closeOnCancel: false,
                closeOnEscape: false,
                closeOnOutsideClick: false
            }
            confBox.show();
            $(document).on('confirmation', '.remodal', function () {
                confBox.hide();
            });
            $(document).on('closed', '.remodal', function () {
                confBox.hide();
            });
        } else {
            remodalInst.close();
        }
    });

    $('#language-selectize, #location-selectize').selectize({
        persist: false,
        plugins: ['remove_button']
    });

    var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' +
                  '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';
    $('#share-selectize').selectize({
        persist: false,
        delimiter: ',',
        plugins: ['remove_button'],
        createFilter: function(input) {
            var match, regex;

            // email@address.com
            regex = new RegExp('^' + REGEX_EMAIL + '$', 'i');
            match = input.match(regex);
            if (match) return !this.options.hasOwnProperty(match);

            return false;
        },
        create: function(input) {
            if ((new RegExp('^' + REGEX_EMAIL + '$', 'i')).test(input)) {
                return {
                    value: input,
                    text: input
                }
            }
            var match = input.match(new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i'));
            if (match) {
                return {
                    value: input,
                    text: input
                }
            }
            return false;
        }
    });

    $('#category-selectize').selectize({
        persist: false,
        plugins: ['remove_button'],
        labelField: 'name',
        labelValue: 'icon',
        render: {
            item: function(item, escape) {
                return "<div class='item'><span class='ico ico-" + escape(item.name) + "' data-grunticon-embed></span>" + escape(item.name) + "</div>";
            },
            option: function(item, escape) {
                return "<div class='option'><span class='ico ico-" + escape(item.name) + "' data-grunticon-embed></span>" + escape(item.name) + "</div>";
            }
        }
    });

    grunticon(['/static/images/output/icons.data.svg.css',
                '/static/images/output/icons.data.png.css',
                '/static/images/output/icons.fallback.css'], 
                grunticon.svgLoadedCallback );


    function isIE () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1]) : false;
    }

    if (!Modernizr.svg || (isIE() && isIE() < 11)) {
        var $logoSvg = $('.logo_svg'),
            $logoPng = $('.logo_png');

        if ($logoSvg.length > 0 && $logoPng.length > 0) {
            $logoSvg.hide();
            $logoPng.show();
        }
    }

    /**
     * Homepage javascript
     */
    $.easing.superSlowEasing = function (x, t, b, c, d) {
        return (t===d) ? b+c : c * (-Math.pow(2, -18 * t/d) + 1) + b;
    };

    $('.count').each(function () {
        $(this).prop('counter', 0).animate({
            counter: $(this).text()
        }, {
            duration: 4000,
            easing: 'superSlowEasing',
            step: function (now) {
                $(this).text(Math.ceil(now).toLocaleString('en'));
            },
            complete: function() {
                if ($(this).parents('.tw-bg-b').length) {
                    $('<span> +</span>').hide().appendTo($(this)).fadeIn(800);
                }
            }
        });
    });


    tobaco.init(jQuery);
});
