define([
    'backbone',
    'views/page',
    'text!templates/main/sos.html',
    'app/helper/ga'
], function (
    Backbone,
    PageView,
    template,
    ga
) {
    'use strict';

    var cid = 'sos';
    var pageView = new PageView({
        html: template,
        Page: {
            events: {
                'click #sosPhone': function (e) {
                    e.preventDefault()

                    ga.trackEvent('button', 'push', 'push-representatives')
                    location.href = this.$('#sosPhone').attr('href')
                }
            },

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
            show: false
        }
    });

    return pageView.init();
});
