/* global define */
define([
    'backbone'
], function (
    Backbone
) {
    "use strict";

    return Backbone.Model.extend({
        defaults: {
            name: '',
            text: '',
            image: ''
        }
    });
});