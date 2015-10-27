(function() {

    var $document = $(document);

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(string) {
        var rgb = string.replace(/^rgb\((.+)\)/, "$1").split(",");

        return "#" + componentToHex(+rgb[0]) + componentToHex(+rgb[1]) + componentToHex(+rgb[2]);
    }

    var Tabs = (function() {
        function Tabs() {
            this.$container = $(".tobacco-analyses");

            this.addHandler();
        }

        Tabs.prototype = {};

        Tabs.prototype.addHandler = function() {
            var that = this;
            var clicked = function(event) {
                event.preventDefault();

                id = $(this).attr("href").substring(1);

                that.showTab(id);
            };

            this.$container.on("click", ".tobacco-analyses__aside__tab", clicked);
        };

        Tabs.prototype.showTab = function(id) {
            // Update showed block
            this.$container.find(".tobacco-analyses__tab-container:not(#" + id + ")").addClass("-hidden");
            this.$container.find("#" + id).removeClass("-hidden");

            // Update link style
            this.$container.find(".tobacco-analyses__aside__tab").removeClass("-active").filter("[href=#" + id + "]").addClass("-active");
        };

        return Tabs;
    })();

    var DateRange = (function() {
        function DateRange() {
            this._init();
        }

        DateRange.prototype = {};

        DateRange.prototype._init = function() {
            // $(".tobacco-analyses__area__date").dateRangePicker(this._config());
        };

        DateRange.prototype._config = function() {
            return {
                startOfWeek: "monday",
                format: "MMM D, GGGG",
                separator: " - ",
                shortcuts: null,
                customShortcuts: [{
                    name: 'Predefined date range',
                    dates: function() {
                        var start = moment().day(0).toDate();
                        var end = moment().day(6).toDate();
                        return [start, end];
                    }
                }]
            };
        };

        return DateRange;
    })();

    var Menu = (function() {
        function Menu() {
            var clicked = function(event) {
                $(this).closest(".tobacco-analyses__area__header__menu")
                    .toggleClass("tobacco-analyses__area__header__menu--opened");

                return false;
            };

            $(".tobacco-analyses__area__header__menu__trigger").on("click", clicked);

            $(document).on("click", function() {
                $(".tobacco-analyses__area__header__menu--opened").removeClass("tobacco-analyses__area__header__menu--opened");
            });
        }

        Menu.prototype = {};

        return Menu;
    })();

    var Sort = (function() {
        function Sort() {
            var that = this;

            that.$links = $(".tobacco-analyses__aside__sort");

            var clicked = function(event) {
                event.preventDefault();

                var $this = $(this);

                if ($this.hasClass("-active")) {
                    $this.toggleClass("-inverse");
                } else {
                    that.$links.removeClass("-inverse").removeClass("-active");
                    $this.addClass("-active");
                }

                that.sort($this);
            };

            that.$links.on("click", clicked);
        }

        Sort.prototype = {};

        var _iteratee = function(property) {
            return function(object) {
                return object[property];
            };
        };

        var _appendTo = function($element) {
            return function(object) {
                $element.append(object);
            };
        };

        Sort.prototype.sort = function($link) {
            $(".tobacco-analyses__aside__items").each(function(index, list) {
                $list = $(list);

                var sortedList = this._sortInList($list, $link.attr("data-sortby"), $link.hasClass("-inverse"));

                this._updateList($list, sortedList);
            }.bind(this));
        };

        Sort.prototype._sortInList = function($list, kind, inversed) {
            var objects = [];

            $list.find(".tobacco-analyses__aside__item").each(function(index, item) {
                var $item = $(item);

                objects.push({
                    value: $item.attr("data-sortby-" + kind),
                    object: $item
                });
            });

            var sortedObjects = _.sortBy(objects, _iteratee('value'));

            if (!inversed) {
                sortedObjects = sortedObjects.reverse();
            }

            return _.map(sortedObjects, _iteratee('object'));
        };

        Sort.prototype._updateList = function($list, items) {
            $list.html("");

            return _.each(items, _appendTo($list));
        };

        return Sort;
    })();

    var initSelect = function(selector) {
        $selects = $(selector);

        var tpl = function(state) {
            if (!state.id) { return state.text; }

            return $('<span class="select2__item select2__item--' + state.id + '"><i></i>' + state.text + '</span>');
        };

        $selects.each(function() {
            var $select = $(this);

            if ($select.is("[name=\"c\"]")) {
                var options = {
                    minimumResultsForSearch: Infinity,
                    templateResult: tpl,
                    templateSelection: tpl
                };
            } else {
                var options = {
                    minimumResultsForSearch: Infinity
                };
            }

            // console.log($select.val());

            $select.select2(options);

            // Fix for firefox:
            // For [type='search'] inputs firefox hardcode text styles
            $(".select2-search__field").attr("type", "text");
        });
    };

    var destroySelect = function(selector) {
        var $select = $(selector);

        if ($select.hasClass("select2-hidden-accessible")) {
            $select.select2().select2("destroy");
        }
    };

    var Modalwin = (function() {
        function Modalwin() {
            this.$modal = $(".modalwin");

            $document.on("click", ".modalwin__shadow, .modalwin__close", this.hide.bind(this));
        }

        Modalwin.prototype = {};

        Modalwin.prototype.hide = function() {
            this.$modal.addClass("-hidden");
            $("body").removeClass("-locked");
        };

        Modalwin.prototype.open = function(type, data, $trend) {
            $("body").addClass("-locked");
            destroySelect(".modalwin select");
            var $form = this.$modal.find("form");
            this.$modal.attr("data-type", type);
            this.$modal.data("$trend", $trend);
            $form[0].reset();
            $form.find("option[selected]").removeAttr("selected");

            this.fillData(type, data);

            this.$modal.removeClass("-hidden");
            initSelect(".modalwin select");
        };

        Modalwin.prototype.fillData = function(type, data) {
            var $modal = this.$modal;
            var $title = $modal.find(".modalwin__title");

            $title.text($title.data("txt-" + type));

            if (type === "edit") {
                $modal.find(".js-trends-form-keywords").val(data.keywords);
                $modal.find(".js-trends-form-title").val(data.title);

                $.each(["categories", "locations", "languages"], function(index, fieldName) {
                    $.each(data[fieldName], function(index, item) {
                        $option = $modal.find(".js-trends-form-" + fieldName).find("option[value=" + item + "]");
                        $option.attr("selected", "selected");

                        // Fix for firefox:
                        // Firefox use selected property for option to get value
                        // of select
                        $option.get(0).selected = true;
                    });
                });
            }
        };

        return Modalwin;
    })();

    var Trends = (function() {
        var $document = $(document)

        function Trends() {
            var that = this;

            this._addHandler();

            $(".tobacco-analyses__trends__item .tobacco-analyses__trend").each(function(index, item) {
                var color = rgbToHex($(this).find(".tobacco-analyses__trend__color").css("backgroundColor"));

                if (that._colors.indexOf(color) === -1) {
                    that._colors.push(color);
                }
            });
        }

        Trends.prototype = {};

        Trends.prototype["new"] = function() {
            page.modalwin.open("create");
        };

        Trends.prototype.edit = function($trend) {
            page.modalwin.open("edit", this._data($trend), $trend);
        };

        Trends.prototype.remove = function($trend) {
            page.modalwin.hide();

            var color = rgbToHex($trend.find(".tobacco-analyses__trend__color").css("background-color"));

            this._colors.splice(this._colors.indexOf(color), 1);

            $trend.parent().remove();
        };

        Trends.prototype.add = function($form) {
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
            $tpl.find(".tobacco-analyses__trend__text").text(data.keywords);

            $tpl.attr("data-trend-title", data.title);
            $tpl.attr("data-trend-keywords", data.keywords);
            $tpl.attr("data-trend-categories", data.categories.join(","));
            $tpl.attr("data-trend-locations", data.locations.join(","));
            $tpl.attr("data-trend-languages", data.languages.join(","));

            $tpl.insertBefore($(".tobacco-analyses__trends__item").last());
            $tpl.wrap("<div class='tobacco-analyses__trends__item'></div>");

            var count = $(".tobacco-analyses__trends__item").length;

            $tpl.find(".tobacco-analyses__trend__color").css({
                backgroundColor: this.getColor()
            });
        };

        Trends.prototype.getColor = function() {
            var colors = [
                '#478bcc',
                '#e267a0',
                '#4ed99e',
                '#ad5bfd',
                '#fe9776'
            ];

            var that = this;

            var pickedColor = "";

            $.each(colors, function(index, color) {
                if (that._colors.indexOf(color) === -1) {
                    pickedColor = color;
                    return false;
                }
            });

            pickedColor = pickedColor || "#000";

            that._colors.push(pickedColor)

            return pickedColor;
        };

        Trends.prototype._colors = [];

        Trends.prototype._data = function($trend) {
            return {
                title: $trend.data("trend-title"),
                keywords: $trend.data("trend-keywords"),
                categories: ("" + $trend.data("trend-categories")).split(","),
                locations: ("" + $trend.data("trend-locations")).split(","),
                languages: ("" + $trend.data("trend-languages")).split(",")
            };
        };

        Trends.prototype._addHandler = function() {
            var that = this;

            var addTrend = function(event) {
                event.preventDefault();

                that["new"]();
            };

            var editTrend = function(event) {
                event.preventDefault();

                that.edit($(this));
            };

            var removeTrendFromList = function(event) {
                event.preventDefault();
                event.stopPropagation();

                var $trend = $(this).closest(".tobacco-analyses__trend");

                that.remove($trend);
            };

            var removeTrendFromEditor = function(event) {
                event.preventDefault();

                var $trend = page.modalwin.$modal.data("$trend");

                that.remove($trend);
            };

            var addTrendFromEditor = function(event) {
                event.preventDefault();

                that.add(page.modalwin.$modal.find("form"));
                page.modalwin.hide();
            };

            // $document.on("click", ".tobacco-analyses__addtrend", addTrend);
            // $document.on("click", ".tobacco-analyses__trend:not(.-inactive)", editTrend);
            // $document.on("click", ".tobacco-analyses__trend__remove", removeTrendFromList);
            // $document.on("click", ".js-trend-remove", removeTrendFromEditor);
            // $document.on("click", ".js-trend-add", addTrendFromEditor);
        };

        return Trends;
    })();

    var initTooltip = function(selector) {
        $(selector).tooltip({
            position: {
                my: "left center",
                at: "right+15"
            },
            show: {
                duration: 100
            }
        });
    };

    window.page = {};

    var onload = function() {
        page.tabs = new Tabs();
        // page.dateRange = new DateRange();
        page.menu = new Menu();
        page.sort = new Sort();
        page.modalwin = new Modalwin();
        page.trends = new Trends();

        initSelect(".modalwin select");
        initTooltip(".js-tooltip");
    };

    window.actions = {
        "click_save_to_my_analyses": function(event) {
            event.preventDefault();
            alert("action: click_save_to_my_analyses")
        },

        "click_download_csv": function(event) {
            event.preventDefault();
            alert("action: click_download_csv");
        }
    }

    $document.ready(onload);

})();
