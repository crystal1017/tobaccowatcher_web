/* global tobaco, Backbone, jQuery, d3, crossfilter, dc */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Trends = tobaco.Views.Trends || {};

(function(tobaco, Backbone, $, d3, crossfilter, dc) {
    'use strict';

    tobaco.Views.Trends.Plot = Backbone.View.extend({
        initialize: function(options) {
            this.data = {};
            this.parseDate = d3.time.format("%m/%d/%Y").parse;
            this.ndx = crossfilter([]);
            this.datePDim = this.ndx.dimension(function(d) {
                return d.date;
            });
            this.dateDim = this.ndx.dimension(function(d) {
                return [d.date, d.type, d.title];
            });
            this.group = this.dateDim.group().reduceSum(function(d) {
                return +d.value;
            });
            this.typeDim = this.ndx.dimension(function(d) {
                return d.type;
            });
            this.valueDim = this.ndx.dimension(function(d) {
                return d.value;
            });
            this.round = d3.time.month.round;
            this.unit = d3.time.months;
            this.draw();
        },

        updateRange: function(from, to) {
            var defaultFromDate = this.toRangeDateFormat([2015, 5, 10]);
            var defaultToDate = this.toRangeDateFormat(new Date());

            this.minDate = this.parseDate(this.toRangeDateFormat(from) || defaultFromDate);
            this.maxDate = this.parseDate(this.toRangeDateFormat(to) || defaultToDate);

            var range = moment.range(this.minDate, this.maxDate);

            if (range.diff('days') < 91) {
                this.updateRound('day');
            } else if (range.diff('months') < 12) {
                this.updateRound('week');
            } else {
                this.updateRound('month');
            }
        },

        toRangeDateFormat: function(date) {
            return moment(date).format("MM/DD/YYYY");
        },

        updateRound: function(round) {
            if (round === 'day') {
                this.round = d3.time.day.round;
                this.unit = d3.time.days;
            } else if (round === 'week') {
                this.round = d3.time.week.round;
                this.unit = d3.time.weeks;
            } else if (round === 'month') {
                this.round = d3.time.month.round;
                this.unit = d3.time.months;
            }
        },

        updateData: function(data, type, title) {
            var newRecords = [],
                yValues = [],
                yAxisValues = [];

            data = d3.csv.parse(data);

            data.forEach(function(d) {
                yValues.push(this._roundFloat(d.count));
            }.bind(this));

            data.forEach(function(d) {
                var r = {};
                r['date'] = this.parseDate(d.date);
                r['type'] = type;
                r['title'] = title;
                r['value'] = this._roundFloat(d.count);

                newRecords.push(r);
            }.bind(this));

            this.ndx.add(newRecords);
        },

        removeData: function(type) {
            this.typeDim.filter(type);

            this.ndx.remove();

            this.typeDim.filterAll();
        },

        redraw: function() {
            this.chart
                .x(d3.time.scale().domain([this.minDate, this.maxDate]))
                .y(d3.scale.linear().domain([0, this.valueDim.top(1)[0] ? this.valueDim.top(1)[0].value : 10]))
                .round(this.round)
                .xUnits(this.unit);

            dc.renderAll();
        },

        draw: function() {
            var m_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            this.chart = dc.seriesChart("#trends-plot");
            this.chart.ordinalColors(this._colors);
            this.chart.margins().left = 40;

            this.chart
                .width($('.tobacco-analyses__area__body').width())
                .height(255)
                .chart(function(c) { return dc.lineChart(c).interpolate('linear'); })
                .renderHorizontalGridLines(true)
                .x(d3.time.scale().domain([this.minDate, this.maxDate]))
                .round(this.round)
                .xUnits(this.unit)
                .brushOn(false)
                .elasticY(true)
                .yAxisPadding('5%')
                .mouseZoomable(false)
                .dimension(this.dateDim)
                .group(this.group)
                .seriesAccessor(function(d) {return d.key[1];})
                .keyAccessor(function(d) {return +d.key[0];})
                .valueAccessor(function(d) {return +d.value;})
                .title(function(d) {
                    var date = moment(d.key[0]).format("MMMM YYYY");
                    var color = this._colors[d.key[1] - 1];
                    var title = d.key[2];

                    return [date, color, title, d.value].join(",");

                    // var curr_date = date.getDate();
                    // var curr_month = date.getMonth();
                    // var curr_year = date.getFullYear();

                    // return m_names[curr_month] + " " + curr_date + ", " + curr_year + " : " + (d.value ? d.value : 0);
                }.bind(this))
                .yAxis().tickFormat(function(v) {
                    return v + "%";
                });

            var $tooltip = $(".tobacco-analyses__area__tooltip");
            var $container = $("#trends-plot");
            var timer;
            var fixed = false;

            var showTooltip = function(index, data, $dot) {
                var items = "";

                $tooltip.find(".tobacco-analyses__area__tooltip__title").text(data[0]);

                clearTimeout(timer);

                $container.find(".sub").each(function(i, subNode) {
                    var $sub = $(subNode);
                    var $dot = $sub.find(".dot").eq(index);

                    if ($dot.attr("data-text")) {
                        var data = $dot.attr("data-text").split(",");
                    } else {
                        $dot.attr("data-text", $dot.text());
                        var data = $dot.text().split(",");
                        $dot.html("");
                    }

                    items += "<li><i style='background-color: " + data[1] + ";'></i><strong>" + data[2] + "</strong><b>" + data[3] + "</b></li>";

                    $dot.css({
                        "fill-opacity": 0.8,
                        "stroke-opacity": 0
                    });
                });

                $tooltip.find("ul").html(items);

                $tooltip.stop().fadeIn(0);
            };

            var hideTooltip = function() {
                $container.find(".dot").css({
                    "fill-opacity": 0,
                    "stroke-opacity": 0
                });
                if (!fixed) {
                    $tooltip.stop().fadeOut(0);
                }
            };

            var mouseover = function(event) {
                var $dot = $(event.target);

                $container.find(".dot").css({
                    "fill-opacity": 0,
                    "stroke-opacity": 0
                });

                var strData = $dot.attr("data-text") || $dot.text();
                var data = strData.split(",");

                showTooltip($dot.index() - 2, data, $dot);
                fixed = false;
            };

            var mouseout = function(event) {
                hideTooltip();
            };

            var mouseoverTooltip = function(event) {
                clearTimeout(timer);
                $tooltip.stop().fadeIn(0);
            };

            var mouseoutTooltip = function(event) {
                if (!fixed) {
                    hideTooltip();
                }
            };

            var clickedOutside = function(e) {
                var $target = $(e.target);

                if (fixed && !$target.closest(".tobacco-analyses__area__tooltip").size()) {
                    fixed = false;
                    hideTooltip();
                }
            };

            var clicked = function(e) {
                e.preventDefault();
                e.stopPropagation();

                var $dot = $(e.target);

                var strData = $dot.attr("data-text") || $dot.text();
                var data = strData.split(",");

                showTooltip($dot.index() - 2, data, $dot);

                fixed = true;
            };

            $container.off(".tooltip_dot");
            $container.off(".tooltip");
            $container.on("mouseover.tooltip_dot", ".dot", mouseover);
            $container.on("mouseleave.tooltip_dot", ".dot", mouseout);
            $container.on("click.tooltip_dot", ".dot", clicked);
            $("#trends").on("mouseover.tooltip", ".tobacco-analyses__area__tooltip", mouseoverTooltip);
            $("#trends").on("mouseleave.tooltip", ".tobacco-analyses__area__tooltip", mouseoutTooltip);
            $(document).on("click", clickedOutside);

            dc.renderAll();
        },

        _colors: ['#478bcc', '#e267a0', '#4ed99e', '#ad5bfd', '#fe9776'],

        _roundFloat: function(d) {
            return parseFloat(Math.round(d * 100) / 100).toFixed(2);
        }
    });

})(tobaco, Backbone, jQuery, d3, crossfilter, dc);
