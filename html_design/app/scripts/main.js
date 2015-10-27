/*global Modernizr */

$(document).ready(function() {
    'use strict';

    function isIE () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1], 10) : false;
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
});
