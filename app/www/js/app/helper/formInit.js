/* global define */
define([
    'backboneForm'
], function (
    Form
) {
    'use strict';

    /**
     * @property {object} Form.Fieldset
     * @property {object} Form.Field
     * @property {object} Form.editors
     */
    Form.Fieldset.template = _.template('<div data-fields></div>');
    Form.Field.template = _.template('\
    <div class="form-line field-<%= key %>">\
        <label class="label" for="<%= editorId %>">\
            <% if (titleHTML){ %>\
                <%= titleHTML %>\
            <% } else { %>\
                <%- title %>\
            <% } %>\
        </label>\
        <div class="form-line__controls" data-editor></div>\
    </div>\
    ');

    Form.editors.Base.prototype.className = 'input';
    Form.editors.Select.prototype.className = 'select';
    Form.Field.errorClassName = 'has-error';

    // переопределили стандартное поведение на событие keyup
    Form.editors.Text.prototype.events.keyup = function (e) {
        var self = this;

        if (e.keyCode === 13) {
            self.$el.blur();
        }

        setTimeout(function() {
            self.determineChange();
        }, 10);
    };
    Form.validators.required = function(options) {
        options = _.extend({
            type: 'required',
            message: this.errMessages.required
        }, options);

        return function required(value) {
            if (typeof value === 'string') {
                value = value.trim();
            }
            options.value = value;

            var err = {
                type: options.type,
                message: _.isFunction(options.message) ? options.message(options) : options.message
            };

            if (
                value === null ||
                value === undefined ||
                value === false ||
                value === '' ||
                (typeof value === "object" && !value.length)
            ) return err;
        };
    };

    Form.editors.Date.monthNames = 'Январь Февраль Март Апрель Май Июнь Июль Август Сентябрь Октябрь Ноябрь Декабрь'.split(' ');
    Form.editors.Date.template = _.template('\
    <div>\
        <select class="select" data-type="date"><%= dates %></select>\
        <select class="select" data-type="month"><%= months %></select>\
        <select class="select" data-type="year"><%= years %></select>\
    </div>\
    ');

    Form.editors.Radio.prototype.className = 'cr-list';
    Form.editors.Checkboxes.prototype.className = 'cr-list cr-list_checkbox';
});
