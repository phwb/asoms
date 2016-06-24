/*global define, _*/
/*jshint multistr: true */
define([
    'backbone',
    'backboneForm',
    'models/policy',
    'collections/policies',
    'views/page',
    'text!templates/policies/add.html'
], function (
    Backbone,
    Form,
    Policy,
    Policies,
    PageView,
    addPage
) {
    'use strict';

    var forms = {};
    return function (id, callback) {
        var policy, isNew = id === undefined;

        policy = isNew ? new Policy() : Policies.get(id);
        if (isNew) {
            id = 'new';
        }

        if (forms[id] === undefined) {
            var form = new Form({
                model: policy,
                events: {
                    submit: function (e) {
                        var errors = this.commit();

                        if (!errors) {
                            if (isNew) {
                                Policies.add(this.model);
                            }

                            // при сохранении или обновлении модели удалим закешированую форму
                            Backbone.Events.trigger('page:remove', forms[id].page.cid);
                            delete forms[id];
                        }

                        e.preventDefault();
                    }
                }
            });

            /* --- Page view --- */
            var pageView = new PageView({
                html: addPage,
                Page: {
                    render: function () {
                        this.$('#addForm').html( form.render().el );
                        return this;
                    }
                },
                Toolbar: {
                    events: {
                        'click #savePolicy': 'savePolicy'
                    },
                    savePolicy: function () {
                        form.$el.submit();
                    }
                }
            });

            forms[id] = pageView.init();
        }

        return callback(undefined, forms[id]);
    };
});
