/* global tobaco, Backbone, jQuery */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Trends = tobaco.Views.Trends || {};

(function(tobaco, Backbone, $) {
    'use strict';

    tobaco.Views.Trends.Timeframe = Backbone.View.extend({
        initialize: function(options) {
        },

        init: function(_dates) {
            var customShortcuts = function() {
                var shortcuts = [];
                $.each(_dates, function(key, item) {
                    shortcuts.push({
                        name: key,
                        dates: function() {
                            $(".tobacco-analyses__area__date").data("date_interval", key);

                            return item;
                        }
                    });
                });

                return shortcuts;
            };

            var newValue = '';

            $(".tobacco-analyses__area__date")
                .val(moment(new Date('09/01/2014')).format("GGGG-MM-DD") + " - " + moment(new Date()).format("GGGG-MM-DD"))
                .dateRangePicker({
                    startOfWeek: "monday",
                    separator: " - ",
                    shortcuts: null,
                    customShortcuts: customShortcuts()
                })
                .bind('datepicker-change', function(event, obj) {
                    this.updateRange(obj);

                    $(".tobacco-analyses__area__date").val(newValue || obj.value);
                }.bind(this));

            document.addEventListener('click', function(e) {
                var $item = $(e.target).closest('.custom-shortcut');

                $item.addClass('-active').siblings().removeClass('-active');

                newValue = $item.text();
            }, true);

            this.trigger('updateRound', 'month');
            this.updateRange({
                date1: new Date('09/01/2014'),
                date2: new Date()
            });
        },

        updateRange: function(obj) {
            this.trigger('updateRange', {
                from_date: obj.date1,
                to_date: obj.date2
            });
        }
    });
})(tobaco, Backbone, jQuery);
