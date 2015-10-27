/* global tobaco, Backbone, jQuery */

tobaco.Views = tobaco.Views || {};
tobaco.Views.Alerts = tobaco.Views.Alerts || {};

(function(tobaco, Backbone, $) {
    'use strict';

    tobaco.Views.Alerts.List = Backbone.View.extend({
        events: {
            'click .nav-tabs': 'tabs',
            'click .js-delete': 'delete',
            'click .delete-alert': 'confDelete',
            'click .edit-not-own-alert': 'duplicate',
            'click .duplicate-alert': 'confDuplicate',
            'click .hide-conf-box': 'hideConf',
            'click .js-toggle': 'togglePlayPause',
            'click .btn-save-alert.update': 'update',
            'click .btn-save-alert.create': 'create',
            'change :input': 'checkForChange',
            'ss-added .dragdrop, .dragshared': 'cloningAlert'
        },

        initialize: function(options) {
            this.a = 1;
            this.dragDropInit = $('.dragdrop').shapeshift({
                selector: ".single-alert-box",
                enableResize: false,
                align: "left",
                paddingX: 0,
                paddingY: 0,
                gutterX: 35,
                gutterY: 70,
                colWidth: 190,
                animated: false,
                minColums: 4,
                dragClone: false,
                enableDrag: true,
                enableCrossDrop: true
            });


            this.dragSharedInit = $('.dragshared').shapeshift({
                selector: ".single-alert-box",
                enableResize: false,
                align: "left",
                paddingX: 0,
                paddingY: 0,
                gutterX: 35,
                gutterY: 70,
                colWidth: 190,
                animated: false,
                minColums: 4,
                deleteClone: true,
                dragClone: true,
                enableDrag: true,
                enableCrossDrop: false
            });

            // hack for shapeshift to initialize inside bootstrap tabs (display: none problem)
            $('.tab-content').addClass('initialized');
        },

        tabs: function(e) {
          e.preventDefault();
          $(this).tab('show');
        },

        delete: function(e) {
            this.alert = $(e.currentTarget).parent().parent();
            this.confBox = this.alert.find(".delete-confirmation-box");

            this.confBox.show();

            e.preventDefault();

        },

        confDelete: function(e) {

            $.ajax({
                type: 'POST',
                url: '/alert/' + this.alert.attr('data-alert-id') + '/',
                data: '_method=delete',
                success: function() {
                    window.location = window.location;
                }
            });

            e.preventDefault();
            
        },

        duplicate: function(e) {
            this.alert = $(e.currentTarget).parent().parent();

            this.confDuplicateBox = this.alert.find(".edit-confirmation-box");
            this.confDuplicateBox.show();

            e.preventDefault();
        },

        confDuplicate: function(e) {
            console.log('Here duplication action will go on');
            e.preventDefault();
        },

        hideConf: function(e) { 
            $(".delete-confirmation-box, .edit-confirmation-box").hide();

            e.preventDefault();
        },

        togglePlayPause: function(e) {
            var $alert = $(e.currentTarget).parent(),
                $icon = $alert.find('.ico');

            if (!$alert.data('alert-is-paused')) {
                $icon.removeClass('ico-play').addClass('ico-pause');
            } else {
                $icon.removeClass('ico-pause').addClass('ico-play');
            }

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: '/alert/' + $alert.data('alert-id') + '/',
                data: '_method=put&is_paused=' + $alert.data('alert-is-paused'),
                success: function(data) {
                    if (data.success) {
                        if ($alert.data('alert-is-paused')) {
                            $alert.data('alert-is-paused', false);
                        } else {
                            $alert.data('alert-is-paused', true);
                        }
                    }
                }
            });

            e.preventDefault();
        },

        update: function(e) {
            var id = $(e.currentTarget).attr('data-alert-id');

                $.ajax({
                    type: 'POST',
                    url: '/alert/' + id + '/',
                    data: this.data + '&_method=put',
                    dataType: 'json',
                    success: function(response) {
                        if (response.success) {
                            window.location = window.location.origin + '/alerts/';
                        } else {
                            $('.alert-name input').addClass('error');
                            document.location = document.location.origin + document.location.pathname + "#filters";
                        }
                    }
                });

            e.preventDefault();
        },

        create: function(e) {

                $.ajax({
                    type: 'POST',
                    url: '/alert/',
                    data: this.data,
                    dataType: 'json',
                    success: function(response) {
                        if (response.success) {
                            window.location = window.location.origin + '/alerts/';
                        } else {
                            $('input.alert-name ').addClass('error');
                            document.location = document.location.origin + document.location.pathname + "#filters";
                        }
                    }
                });

            e.preventDefault();
        },

        checkForChange: function(){   
            $(".btn-save-alert").removeAttr("disabled");
        },

        cloningAlert: function(e, selected) {
            var $containers = $(".dragshared, .dragdrop");
            $('#holder').addClass('overlay');
            setTimeout(function() { 
                $(selected).append("<div class='duplication-confirmation-box'><p>Do you want to duplicate this alert from Shared Alerts to Your Alerts?</p><a href='#' class='btn conf-box-btn conf-duplicate-alert'><span>Duplicate</span><span class='ico ico-check'></span></a><a href='#' class='btn conf-box-btn remove-duplicated'><span>No</span><span class='ico ico-cancel'></span></a></div>");    
                var duplicationBox = $('.duplication-confirmation-box');
                if ($('#holder').hasClass('overlay')) {
                    console.log($('#holder').hasClass('overlay'));
                    this.dragSharedInit.options = {
                        enableDrag: false
                    }
                } else {
                    console.log($('#holder').hasClass('overlay'));
                    this.dragSharedInit.options = {
                        enableDrag: true
                    }
                }

                $('.conf-duplicate-alert').on('click.confDuplication', function(e) {
                    e.preventDefault();
                    duplicationBox.remove();
                    $containers.on("ss-drop-complete", function() { 
                        $(document).off('click.confDuplication');
                    });
                    $("#holder").removeClass('overlay');
                });

                $('.remove-duplicated').on('click.confDuplication', function(e) {
                    var selectedAlertId = $(selected).attr("data-alert-id");
                    var clonedParent = ".dragshared .single-alert-box[data-alert-id='"+selectedAlertId+"']";
                    e.preventDefault();
                    $(selected).insertAfter('.dragshared [data-alert-id="'+selectedAlertId+'"]');
                    duplicationBox.remove();
                    $(clonedParent+':eq(0)').remove();
                    $containers.trigger("ss-rearrange");
                    $(document).off('click.confDuplication');
                    $("#holder").removeClass('overlay');
                    
                });

                $(document).on("click.confDuplication", function(e) {
                    if ($(selected).find(duplicationBox).length === 1) { 
                        var clickTarget = $(e.target);
                        // if click target has class ... || or is child of this item
                        if ( clickTarget.hasClass('duplication-confirmation-box') || clickTarget.closest('.duplication-confirmation-box').length > 0 ) {
                            //
                        } else {
                            var selectedAlertId = $(selected).attr("data-alert-id");
                            var clonedParent = ".dragshared .single-alert-box[data-alert-id='"+selectedAlertId+"']";
                            e.preventDefault();
                            $(selected).insertAfter('.dragshared [data-alert-id="'+selectedAlertId+'"]');
                            duplicationBox.remove();
                            $(clonedParent+':eq(0)').remove();
                            $containers.trigger("ss-rearrange");
                            $(document).off('click.confDuplication');
                             $("#holder").removeClass('overlay');
                        }
                    }
                });
            }, 300);
        }




    });

})(tobaco, Backbone, jQuery);
