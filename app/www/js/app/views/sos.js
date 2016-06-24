define([
    'backbone',
    'views/page',
    'text!templates/main/sos.html'
], function (
    Backbone,
    PageView,
    template
) {
    'use strict';

    var cid = 'sos';
    var pageView = new PageView({
        html: template,
        Page: {
            init: function () {
                var $sos = this.$el.find('#sosPhone');

                // событие анимации кнопкт SOS
                Backbone.Events.on('page:beforeAdd', function (pageId) {
                    var isMainPage = pageId === cid;
                    $sos[isMainPage ? 'addClass' : 'removeClass']('sos-phone__link_animated');
                });
                Backbone.Events.on('back', function (page) {
                    var isMainPage = page.prev === cid;
                    $sos[isMainPage ? 'addClass' : 'removeClass']('sos-phone__link_animated');
                });
            },
            cid: cid
        },
        Toolbar: {
            events: {
                'click .button_ask': 'showAskFrom'
            },
            showAskFrom: function (e) {
                e.preventDefault();
                Backbone.Events.trigger('action:ask');
            }
        }
    });

    return pageView.init();
});
