/* global tobaco, Backbone, jQuery */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Trends = tobaco.Views.Trends || {};


(function(tobaco, Backbone, $) {
    'use strict';

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(string) {
        var rgb = string.replace(/^rgb\((.+)\)/, "$1").split(",");

        return "#" + componentToHex(+rgb[0]) + componentToHex(+rgb[1]) + componentToHex(+rgb[2]);
    }

    var isExist = function(object) {
        return !!object;
    };

    var _findBy = function(property, array, item) {
        return _.find(array, function(arrayItem) {
            return arrayItem[property] == item[property];
        });
    };

    // Code providing by Django
    // see: https://docs.djangoproject.com/en/1.8/ref/csrf/
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(",");
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    tobaco.Views.Trends.Trends = Backbone.View.extend({
        events: {
            'click .tobacco-analyses__addtrend': 'newTrend',
            'submit .modalwin__body': 'updateTrend',
            'click .tobacco-analyses__trend__remove': 'removePlotFromList',
            'click .tobacco-analyses__trend:not(.-inactive)': 'handlerEditTrend',
            'click .js-save-to-my-analyses': 'saveRTrend',
            'click .js-download-csv': 'downloadCsv',
            'click .js-trend-remove': 'removePlot',
            'click .js-close-trend': 'clean',
            'click .js-view-article': 'goToArticlesFromModalwin',
            'click .tobacco-analyses__area__tooltip__footer': 'goToArticlesFromTooltip',
            'click .tobacco-analyses__aside__item': 'openTrend',
            'click .tobacco-analyses__aside__item__remove': 'removeTrendFromList'
        },

        initialize: function(opti3ons) {
            this.trends = 0;
            this.controls = {};
            this.colors = {
                1: this._colors[0],
                2: this._colors[1],
                3: this._colors[2],
                4: this._colors[3],
                5: this._colors[4]
            };
            // this.addTrend();

            // this.timeframe = new tobaco.Views.Trends.Timeframe({el: $('.trends-timeframe')});
            this.timeframe = new tobaco.Views.Trends.Timeframe({el: $('#trends')});
            this.plot = new tobaco.Views.Trends.Plot();

            this.listenTo(this.timeframe, 'updateRange', this.newTimeRange.bind(this));
            this.listenTo(this.timeframe, 'updateRound', this.newRoundUnit.bind(this));

            $.xhrPool = [];

            $.xhrPool.abortAll = function() {
                $(this).each(function(index, jqXHR) {
                    jqXHR.abort();
                    $.xhrPool.splice(index, 1);
                });
            };

            $.ajaxSetup({
                beforeSend: function(jqXHR) {
                    $.xhrPool.push(jqXHR);
                },
                complete: function(jqXHR) {
                    var index = $.xhrPool.indexOf(jqXHR);

                    if (index > -1) {
                        $.xhrPool.splice(index, 1);
                    }
                }
            });

            var ajaxQueue = $({});

            $.ajaxQueue = function(cb, ajaxOpts) {
                var jqXHR,
                    dfd = $.Deferred(),
                    promise = dfd.promise();
                ajaxQueue.queue(doRequest);

                promise.abort = function(statusText) {
                    if (jqXHR) {
                        return jqXHR.abort(statusText);
                    }

                    var queue = ajaxQueue.queue(),
                        index = $.inArray(doRequest, queue);

                    if (index > -1) {
                        queue.splice(index, 1);
                    }

                    dfd.rejectWith(ajaxOpts.context || ajaxOpts, [promise, statusText, ""]);

                    return promise;
                };

                function doRequest(next) {
                    cb();

                    jqXHR = $.ajax(ajaxOpts)
                        .done(dfd.resolve)
                        .fail(dfd.reject)
                        .then(next, next);
                }

                return promise;
            };

            this.timeframe.init(this._dates);

            var that = this;

            $(".tobacco-analyses__trends__item .tobacco-analyses__trend").each(function(index, item) {
                var color = rgbToHex($(this).find(".tobacco-analyses__trend__color").css("backgroundColor"));

                if (that._colors.indexOf(color) === -1) {
                    that._colors.push(color);
                }
            });

            var trendMouseOver = function() {
                var color = rgbToHex($(this).find(".tobacco-analyses__trend__color").css("backgroundColor"));

                $("#trends-plot").find(".line[stroke="+color+"]").css({
                    "stroke-width": 3
                });
            };

            var trendMouseOut = function() {
                var color = rgbToHex($(this).find(".tobacco-analyses__trend__color").css("backgroundColor"));

                $("#trends-plot").find(".line[stroke="+color+"]").css({
                    "stroke-width": 1
                });
            };

            this.$(".tobacco-analyses__trends")
                .on("mouseover", ".tobacco-analyses__trend", trendMouseOver)
                .on("mouseleave", ".tobacco-analyses__trend", trendMouseOut);
        },

        newTrend: function() {
            if (this.trends >= 5) {
                return false;
            }

            if (this.trends === 0) {
                var trendId = $("#trends").attr("data-trend-id");
                this.clean();
                trendId && $("#trends").attr("data-trend-id", trendId);
            }

            if (page.modalwin) {
                page.modalwin.open('create');
            }
        },

        updateTrend: function() {
            var $form = this.$('form');

            $('.tobacco-analyses__area--start-screen').removeClass('tobacco-analyses__area--start-screen');

            if ($form.parent().attr('data-type') === 'create') {
                this.addTrend();
            } else {
                this.editTrend();
            }

            this._updatePlots();

            return false;
        },

        editTrend: function() {
            var $form = this.$('form');

            var data = {
                title: $form.find(".js-trends-form-title").val(),
                keywords: $form.find(".js-trends-form-keywords").val(),
                categories: $form.find(".js-trends-form-categories").val() || [],
                locations: $form.find(".js-trends-form-locations").val() || [],
                languages: $form.find(".js-trends-form-languages").val() || []
            };

            var $trend = $form.parent().data('$trend');

            $trend.addClass("-inactive");
            $trend.find(".tobacco-analyses__trend__title").text(data.title);
            $trend.find(".tobacco-analyses__trend__text").text(this._tileText(data));
            $trend.attr("data-trend-title", data.title);
            $trend.attr("data-trend-keywords", data.keywords);
            $trend.attr("data-trend-categories", data.categories.join(","));
            $trend.attr("data-trend-locations", data.locations.join(","));
            $trend.attr("data-trend-languages", data.languages.join(","));

            var formData = this.$('form').serialize() + '&' + this.$('form select[name=r]').serialize().replace('r=', 'co=');

            page.modalwin.hide();

            this._fixLongText();

            var no = +$trend.attr("data-trend-no");

            this.calculate(no, formData, $trend);
        },

        addTrend: function() {
            this.trends = this.trends + 1;

            var $form = this.$('form');

            var data = {
                title: $form.find(".js-trends-form-title").val(),
                keywords: $form.find(".js-trends-form-keywords").val(),
                categories: $form.find(".js-trends-form-categories").val() || [],
                locations: $form.find(".js-trends-form-locations").val() || [],
                languages: $form.find(".js-trends-form-languages").val() || []
            };

            var $tpl = $(".tobacco-analyses__trend.-tpl").clone();
            $tpl.removeClass("-tpl").addClass("-inactive");

            $tpl.find(".tobacco-analyses__trend__title").text(data.title);
            $tpl.find(".tobacco-analyses__trend__text").text(this._tileText(data));

            $tpl.attr("data-trend-title", data.title);
            $tpl.attr("data-trend-keywords", data.keywords);
            $tpl.attr("data-trend-categories", data.categories.join(","));
            $tpl.attr("data-trend-locations", data.locations.join(","));
            $tpl.attr("data-trend-languages", data.languages.join(","));

            $tpl.insertBefore($(".tobacco-analyses__trends__item").last());
            $tpl.wrap("<div class='tobacco-analyses__trends__item'></div>");

            var count = $(".tobacco-analyses__trends__item").length;

            var data = this.$('form').serialize() + '&' + this.$('form select[name=r]').serialize().replace('r=', 'co=');

            page.modalwin.hide();

            this._fixLongText();

            var no = this.findNextNo();

            $tpl.find(".tobacco-analyses__trend__color").css({
                backgroundColor: this.colors[no]
            });

            $tpl.attr("data-trend-no", no);

            this.controls[no] = this;

            this.calculate(no, data, $tpl);
        },

        _fixLongText: function() {
            var ellipsis = " + % More";

            $(".tobacco-analyses__trend__text").each(function(index, item) {
                var $item = $(item);

                $item.dotdotdot({
                    ellipsis: ellipsis,
                    fallbackToLetter: false,
                    after: ".tobacco-analyses__trend__text__more",
                    callback: function(isTruncated, orgContent) {
                        if (isTruncated) {
                            var wholeText = orgContent[0].data;
                            var visibleText = $item.text().match(/^(.+)\s\+\s%\sMore$/)[1];
                            var count = wholeText.replace(visibleText + " + ", "").split(" + ").length;

                            $item.text(visibleText + " + " + count + " More");
                        }
                    },
                    lastCharacter: {
                        remove: ["+", " "]
                    }
                });
            })
        },

        _tileText: function(data) {
            var textSeparator = " + ";
            var text = [];

            if (data.keywords.length) {
                text.push($.map(data.keywords.split(" "), function(item) {
                    return "\"" + item + "\"";
                }).join(textSeparator));
            }

            if (data.categories.length && data.categories[0]) text.push(data.categories.join(textSeparator));

            if (data.locations.length && data.locations[0]) {
                text.push($.map(data.locations, function(item) {
                    return $("option[value=" + item + "]").text();
                }).join(textSeparator));
            }

            if (data.languages.length && data.languages[0]) {
                text.push($.map(data.languages, function(item) {
                    return $("option[value=" + item + "]").text();
                }).join(textSeparator));
            }

            return text.join(textSeparator);
        },

        addedTrend: function($trend) {
            if ($trend.size()) {
                $trend.removeClass("-inactive");
            }
        },

        handlerEditTrend: function(e) {
            var $trend = $(e.currentTarget);
            var data = {
                title: $trend.attr("data-trend-title"),
                keywords: $trend.attr("data-trend-keywords"),
                categories: ("" + $trend.attr("data-trend-categories")).split(",").filter(isExist),
                locations: ("" + $trend.attr("data-trend-locations")).split(",").filter(isExist),
                languages: ("" + $trend.attr("data-trend-languages")).split(",").filter(isExist)
            };

            page.modalwin.open("edit", data, $trend);

            return false;
        },

        removePlot: function(e) {
            var $plot = this.$('form').parent().data('$trend');
            this._removePlot($plot);
            page.modalwin.hide();
            return false;
        },

        removePlotFromList: function(e) {
            var $plot = $(e.currentTarget).closest(".tobacco-analyses__trend");
            this._removePlot($plot);
            return false;
        },

        _removePlot: function($plot) {
            var no = +$plot.data("trend-no");
            this.plot.removeData(no);
            this.plot.redraw();
            delete this.controls[no];
            this.trends = this.trends - 1;

            $plot.parent().remove();
            this._updatePlots();

            if (this._plots.length) {
                $(".tobacco-analyses__area").removeClass("tobacco-analyses__area--start-screen");
            } else {
                $(".tobacco-analyses__area").addClass("tobacco-analyses__area--start-screen");
            }
        },

        findNextNo: function() {
            if (!_.has(this.controls, '1')) {
                return 1;
            } else if (!_.has(this.controls, '2')) {
                return 2;
            } else if (!_.has(this.controls, '3')) {
                return 3;
            } else if (!_.has(this.controls, '4')) {
                return 4;
            } else if (!_.has(this.controls, '5')) {
                return 5;
            }

            return 1;
        },

        calculate: function(no, data, $plot) {
            var from_date = moment(this.from_date).format('YYYY-MM-DD');
            var to_date = moment(this.to_date).format('YYYY-MM-DD');

            data = data + '&st=' + from_date + '&e=' + to_date + '&round=' + this.round;

            $.ajaxQueue(function() {
                this.plot.removeData(no);
                // this.controls[no].showLoading();
                this.$('.tobacco-analyses__area').addClass('tobacco-analyses__area--processing');
            }.bind(this), {
                url: '/analyses/',
                data: data,
                type: 'POST'
            }).done(function(data) {
                this.$('.tobacco-analyses__area').removeClass('tobacco-analyses__area--processing');
                this.addedTrend($plot);
                this.plot.updateData(data, no, $plot.attr("data-trend-title"));
                this.plot.redraw();
            }.bind(this));
        },

        newTimeRange: function(range) {
            this.from_date = range.from_date;
            this.to_date = range.to_date;

            var interval = moment.range(this.from_date, this.to_date);

            if (interval.diff('days') < 91) {
                this.round = 'day';
            } else if (interval.diff('months') < 12) {
                this.round = 'week';
            } else {
                this.round = 'month';
            }

            this.plot.updateRange(range.from_date, range.to_date);
            this.plot.redraw();
            this.recalculate();
        },

        newRoundUnit: function(round) {
            this.round = round;
            this.plot.updateRound(round);
            this.plot.redraw();
            this.recalculate();
        },

        recalculate: function() {
            if (typeof this.from_date === 'undefined' && typeof this.to_date === 'undefined') {
                return;
            }

            $(".tobacco-analyses__trend:not(.-tpl)").each(function(index, item) {
                var $plot = $(item);

                var plot = {
                    title: $plot.attr("data-trend-title"),
                    keywords: $plot.attr("data-trend-keywords"),
                    categories: ("" + $plot.attr("data-trend-categories")).split(",").filter(isExist),
                    locations: ("" + $plot.attr("data-trend-locations")).split(",").filter(isExist),
                    languages: ("" + $plot.attr("data-trend-languages")).split(",").filter(isExist)
                };

                var data = $.param({
                    t: plot.keywords,
                    c: plot.categories,
                    r: plot.locations,
                    la: plot.languages,
                    title: plot.title,
                    co: plot.locations
                }, true);

                this.calculate(index + 1, data, $plot);
            }.bind(this));
        },

        downloadCsv: function() {
            var that = this;
            var plots = [];

            $(".tobacco-analyses__trend:not(.-tpl)").each(function(index, item) {
                var $plot = $(item);

                var plot = {
                    title: $plot.attr("data-trend-title"),
                    keywords: $plot.attr("data-trend-keywords"),
                    categories: ("" + $plot.attr("data-trend-categories")).split(",").filter(isExist),
                    locations: ("" + $plot.attr("data-trend-locations")).split(",").filter(isExist),
                    languages: ("" + $plot.attr("data-trend-languages")).split(",").filter(isExist)
                };

                var plotData = {
                    round: that.round,
                    title: plot.title
                }

                if (!!plot.keywords) plotData.t = plot.keywords;
                if (plot.categories.length) plotData.c = plot.categories;
                if (plot.languages.length) plotData.la = plot.languages;
                if (plot.locations.length) {
                    plotData.r = plot.locations;
                    plotData.co = plot.locations;
                }

                plots.push(plotData);
            });

            var params = $.param({
                plots: JSON.stringify(plots),
                st: moment(this.from_date).format('YYYY-MM-DD'),
                e: moment(this.to_date).format('YYYY-MM-DD')
            });

            window.open("/analyses/csv/?" + params, "_blank");

            return false;
        },

        clean: function() {
            // Remove trend id
            $("#trends").removeAttr("data-trend-id");

            // Remove plots list
            $(".tobacco-analyses__trend:not(.-tpl)").parent().remove();

            $(".tobacco-analyses__area").addClass("tobacco-analyses__area--start-screen").removeClass("tobacco-analyses__area--modified");

            $(".tobacco-analyses__aside__item--current").removeClass("tobacco-analyses__aside__item--current");

            this.trends = 0;
            this.controls = {};

            this._plots = [];
            this._oldPlots = [];

            _.times(5, function(index) {
                this.plot.removeData(index + 1);
            }.bind(this));

            return false;
        },

        openTrend: function(e) {
            $.xhrPool.abortAll();

            this.clean();

            var that = this;

            var trendId = +$(e.currentTarget).attr("data-trend-id");

            $(".tobacco-analyses__aside__item--current").removeClass("tobacco-analyses__aside__item--current");
            $(".tobacco-analyses__aside__item[data-trend-id=" + trendId + "]").addClass("tobacco-analyses__aside__item--current");

            $("#trends").attr("data-trend-id", trendId);

            $.ajax({
                url: "/ajax/trend/" + trendId + "/",
                dataType: "json",
                success: function(response) {
                    $(".tobacco-analyses__area").removeClass("tobacco-analyses__area--start-screen");

                    $.each(response.plots, function(index, plot) {
                        var $tpl = $(".tobacco-analyses__trend.-tpl").clone();
                        $tpl.removeClass("-tpl").addClass("-inactive");

                        $tpl.find(".tobacco-analyses__trend__title").text(plot.title);
                        $tpl.find(".tobacco-analyses__trend__text").text(that._tileText(plot));

                        $tpl.attr("data-trend-title", plot.title);
                        $tpl.attr("data-trend-keywords", plot.keywords);
                        $tpl.attr("data-trend-categories", plot.categories.join(","));
                        $tpl.attr("data-trend-locations", plot.locations.join(","));
                        $tpl.attr("data-trend-languages", plot.languages.join(","));
                        $tpl.attr("data-plot-id", plot.id);

                        $tpl.insertBefore($(".tobacco-analyses__trends__item").last());
                        $tpl.wrap("<div class='tobacco-analyses__trends__item'></div>");

                        var data = $.param({
                            t: plot.keywords,
                            c: plot.categories,
                            r: plot.locations,
                            la: plot.languages,
                            title: plot.title,
                            co: plot.locations
                        }, true);

                        that._fixLongText();

                        var no = that.findNextNo();

                        $tpl.find(".tobacco-analyses__trend__color").css({
                            backgroundColor: that.colors[no]
                        });

                        $tpl.attr("data-trend-no", no);

                        that.controls[no] = that;

                        that.calculate(no, data, $tpl);

                        that._updatePlots(true);

                        that.trends = that.trends + 1;
                    });

                    var dateInterval = function() {
                        var dateRange = that._getDate(response.date_interval);

                        if (!dateRange) {
                            dateRange = [that.from_date, that.to_date];
                        }

                        return dateRange;
                    };

                    var date = dateInterval();

                    var $input = $(".tobacco-analyses__area__date");

                    $input.data('dateRangePicker').setDateRange(date[0], date[1]);

                    if (response.date_interval) {
                        $input.val(response.date_interval);

                        $('[shortcut]:contains(' + response.date_interval + ')').parent().addClass('-active');
                    }
                }
            })

            return false;
        },

        _getDate: function(name) {
            return this._dates[name];
        },

        _dates: {
            "2014 - present": [moment("1 Jan 2014", "D MMM YYYY").toDate(), moment().toDate()],
            "Past 7 days": [moment(new Date().setDate(new Date().getDate() - 7 + 1)).toDate(), moment().toDate()],
            "Past 30 days": [moment(new Date().setDate(new Date().getDate() - 30 + 1)).toDate(), moment().toDate()],
            "Past 90 days": [moment(new Date().setDate(new Date().getDate() - 90 + 1)).toDate(), moment().toDate()],
            "Past 12 months": [moment(new Date().setMonth(new Date().getMonth() - 12)).toDate(), moment().toDate()],
            "2015": [moment("1 Jan 2015", "D MMM YYYY").toDate(), moment("1 Jan 2016", "D MMM YYYY").dayOfYear(-1).toDate()],
            "2014": [moment("1 Jan 2014", "D MMM YYYY").toDate(), moment("1 Jan 2015", "D MMM YYYY").dayOfYear(-1).toDate()],
            "2013": [moment("1 Jan 2013", "D MMM YYYY").toDate(), moment("1 Jan 2014", "D MMM YYYY").dayOfYear(-1).toDate()]
        },

        _plots: [],

        _oldPlots: [],

        _updatePlots: function(firstCheck) {
            var plots = [];

            $(".tobacco-analyses__trend:not(.-tpl)").each(function(index, item) {
                var $plot = $(item);

                plots.push({
                    _$: $plot,
                    _id: $plot.attr("data-plot-id") || -1,
                    title: $plot.attr("data-trend-title"),
                    keywords: $plot.attr("data-trend-keywords"),
                    categories: $plot.attr("data-trend-categories"),
                    languages: $plot.attr("data-trend-languages"),
                    locations: $plot.attr("data-trend-locations")
                });
            });

            this._plots = plots;

            if (firstCheck) {
                this._oldPlots = this._plots;
            }

            if (_.isEqual(this._plots, this._oldPlots)) {
                $(".tobacco-analyses__area").removeClass("tobacco-analyses__area--modified");
            } else {
                $(".tobacco-analyses__area").addClass("tobacco-analyses__area--modified");
            }
        },

        saveRTrend: function(e) {
            e.preventDefault();

            var $area = $(".tobacco-analyses__area");

            if ($area.hasClass("tobacco-analyses__area--modified")) {
                var getPreview = function() {
                    var $svg = $("#trends-plot").find("> svg").clone();

                    $svg.attr("xmlns", "http://www.w3.org/2000/svg");
                    $svg.attr("fill", "none");
                    $svg.attr("stroke-width", 2);

                    $svg.find(".axis").remove();
                    $svg.find(".grid-line.horizontal").remove();

                    return $('<div>').append($svg).html();
                };

                var preview = getPreview();

                $area.removeClass("tobacco-analyses__area--modified")

                var ajaxData = {
                    method: "post",
                    dataType: "json",
                    data: {
                        name: "Trend",
                        start_date: moment(this.from_date).format("YYYY-MM-DD"),
                        end_date: moment(this.to_date).format("YYYY-MM-DD"),
                        date_interval: $(".tobacco-analyses__area__date").data("date_interval"),
                        preview: preview,
                        csrfmiddlewaretoken: csrftoken
                    }
                };

                if ($("#trends").attr("data-trend-id")) {
                    var trendId = $("#trends").attr("data-trend-id");

                    ajaxData.url = "/ajax/trend/" + trendId + "/update/";
                    ajaxData.success = function() {
                        $(".tobacco-analyses__aside__item[data-trend-id=" + trendId + "]").find(".tobacco-analyses__aside__item__preview").html(preview);

                        this.saveAllPlots();
                    }.bind(this)

                } else {
                    ajaxData.url = "/ajax/trend/create/";
                    ajaxData.success = function(response) {
                        var trendId = response.id;

                        $("#trends").attr("data-trend-id", trendId);

                        var newTrend = "";
                        newTrend += "<div class=\"tobacco-analyses__aside__item tobacco-analyses__aside__item--current\" data-trend-id=\"" + trendId + "\" data-sortby-name=\"" + response.title + "\" data-sortby-date=\"" + response.created_at + "\">";
                            newTrend += "<div class=\"tobacco-analyses__aside__item__title\">" + trendId + "</div>";
                            newTrend += "<div class=\"tobacco-analyses__aside__item__preview\">" + preview + "</div>";
                            newTrend += "<div class=\"tobacco-analyses__aside__item__remove\">×</div>";
                            newTrend += "<div class=\"tobacco-analyses__aside__item__current\">Currently Viewing</div>";
                        newTrend += "</div>";

                        $("#tobacco-analyses-my .tobacco-analyses__aside__items").append(newTrend);

                        this.saveAllPlots();
                    }.bind(this);
                }

                $.ajax(ajaxData);
            }
        },

        saveAllPlots: function() {
            this._updatePlots();
            $(".tobacco-analyses__area--modified").removeClass("tobacco-analyses__area--modified");

            var plots = this._plots;

            var deletedPlots = [];

            // Populate deletedPlots array
            _.each(this._oldPlots, function(oldPlot) {
                var has = false;
                _.each(plots, function(plot) {
                    if (plot._id == oldPlot._id) {
                        has = true;
                        return false;
                    }
                });

                if (!has) {
                    deletedPlots.push(oldPlot);
                }
            });

            var i = 0;
            var callbackAfterOne = function() {
                if (++i == plots.length + deletedPlots.length) {
                    callbackAfterAll();
                }
            }.bind(this);

            var callbackAfterAll = function() {
                this._updatePlots();
                $(".tobacco-analyses__area--modified").removeClass("tobacco-analyses__area--modified");
                this._oldPlots = this._plots;

                this._saved();
            }.bind(this);

            this._saveAllPlots(plots, callbackAfterOne);
            this._deleteAllPlots(deletedPlots, callbackAfterOne);
        },

        _saveAllPlots: function(plots, callbackAfterOne) {
            return _.each(plots, this._savePlot.bind(this, callbackAfterOne));
        },

        _deleteAllPlots: function(plots, callbackAfterOne) {
            return _.each(plots, this._deletePlot.bind(this, callbackAfterOne));
        },

        _savePlot: function(callbackAfterOne, plot) {
            var url;

            var data = _.omit(plot, '_id', '_$');

            if (!!~plot._id) {
                url = "/ajax/plot/" + plot._id + "/update/";
            } else {
                url = "/ajax/plot/create/";
            }

            return this._sendPlotInfo(url, data, plot._$, callbackAfterOne);
        },

        _deletePlot: function(callbackAfterOne, plot) {
            var plotId = plot._id;

            var url = "/ajax/plot/" + plotId + "/delete/";

            return this._sendPlotInfo(url, {}, null, callbackAfterOne);
        },

        _sendPlotInfo: function(url, data, $plot, callbackAfterOne) {
            var trendId = +$("#trends").attr("data-trend-id");

            data = _.extend({
                trend: trendId,
                csrfmiddlewaretoken: csrftoken
            }, data);

            var complete = function() {
                callbackAfterOne();
            }.bind(this);

            var ajaxData = {
                url: url,
                method: "post",
                dataType: "json",
                data: data,
                success: function(response) {
                    if (response && response.id && $plot && $plot.size()) {
                        $plot.attr("data-plot-id", response.id);
                    }

                    complete();
                }
            };

            return $.ajax(ajaxData);
        },

        _saved: function() {
            var $area = $(".tobacco-analyses__area");

            $area.addClass("tobacco-analyses__area--saved");

            setTimeout(function() {
                $area.removeClass("tobacco-analyses__area--saved");
            }, 3000);
        },

        _colors: ['#478bcc', '#e267a0', '#4ed99e', '#ad5bfd', '#fe9776'],

        goToArticlesFromModalwin: function() {
            var $form = this.$('form');

            var data = {
                title: $form.find(".js-trends-form-title").val(),
                keywords: $form.find(".js-trends-form-keywords").val(),
                categories: $form.find(".js-trends-form-categories").val() || [],
                locations: $form.find(".js-trends-form-locations").val() || [],
                languages: $form.find(".js-trends-form-languages").val() || []
            };

            this._goToArticles(data);

            return false;
        },

        goToArticlesFromTooltip: function() {
            var articlesData = {
                keywords: "",
                categories: [],
                locations: [],
                languages: []
            };

            $(".tobacco-analyses__trend:not(.-tpl)").each(function(index, item) {
                var $plot = $(item);

                var plot = {
                    keywords: $plot.attr("data-trend-keywords"),
                    categories: ("" + $plot.attr("data-trend-categories")).split(",").filter(isExist),
                    locations: ("" + $plot.attr("data-trend-locations")).split(",").filter(isExist),
                    languages: ("" + $plot.attr("data-trend-languages")).split(",").filter(isExist)
                };

                articlesData.keywords = $.trim(articlesData.keywords + " " + plot.keywords);
                articlesData.categories = articlesData.categories.concat(plot.categories);
                articlesData.locations = articlesData.locations.concat(plot.locations);
                articlesData.languages = articlesData.languages.concat(plot.languages);
            });

            this._goToArticles(articlesData);

            return false;
        },

        _goToArticles: function(data) {
            var query_categories = _.map(data.categories, function(text) {
                return "c=" + text;
            }).join("&");

            var query_locations = _.map(data.locations, function(text) {
                return "r=" + text;
            }).join("&");

            var query_languages = _.map(data.languages, function(text) {
                return "la=" + text;
            }).join("&");

            var query = [];

            if (!!data.keywords) query.push("t=" + data.keywords);
            if (!!query_categories) query.push(query_categories);
            if (!!query_locations) query.push(query_locations);
            if (!!query_languages) query.push(query_languages);

            query.push("st=");
            query.push("e=");

            window.open("/articles/?" + query.join("&"), "_blank");
        },

        removeTrendFromList: function(e) {
            var $trend = $(e.currentTarget).closest(".tobacco-analyses__aside__item");

            $.ajax({
                url: "/ajax/trend/" + $trend.attr("data-trend-id") + "/delete/",
                method: "post",
                data: {
                    csrfmiddlewaretoken: csrftoken
                },
                success: function() {
                    if ($trend.hasClass("tobacco-analyses__aside__item--current")) {
                        this.clean();
                    }

                    $trend.remove();
                }.bind(this)
            });

            return false;
        }
    });
})(tobaco, Backbone, jQuery);
