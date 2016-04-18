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
        Toolbar: {
            show: false
        }
    });

    return pageView.init();
});
