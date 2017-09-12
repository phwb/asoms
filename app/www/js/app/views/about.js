define([
    'backbone',
    'views/page',
    'text!templates/about/index.html'
], function (
    Backbone,
    PageView,
    template
) {
    'use strict';

    var pageView = new PageView({
        html: template,
        Page: {
            cid: 'about'
        },
        Toolbar: {
            show: false
        }
    });

    return pageView.init();
});
