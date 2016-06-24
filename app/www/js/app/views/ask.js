define([
    'backbone',
    'backboneForm',
    'app/helper/notify',
    'models/ask',
    'views/page',
    'text!templates/ask/index.html'
], function (
    Backbone,
    Form,
    notify,
    ask,
    PageView,
    template
) {
    'use strict';

    var ajax = Backbone.ajax;
    var $ = Backbone.$;
    var form;

    var pageView = new PageView({
        html: template,
        Page: {
            render: function () {
                form = new Form({
                    model: ask,
                    events: {
                        submit: function (e) {
                            var errors = this.commit();

                            if (!errors) {
                                var params = {
                                    url: 'http://alfastrahoms1.de02.agima.ru/api/addASKRequest/',
                                    data: this.model.toJSON(),
                                    method: 'post',
                                    dataType: 'json',
                                    timeout: 30000
                                };
                                ajax(params)
                                    .done(function (data) {
                                        var message = 'Ваш вопрос успешно отправлен и будет обработан нами в ближайшие время. Спасибо!';
                                        if (data.message && data.status === 'OK') {
                                            message = data.message;
                                        }
                                        notify.alert(message);
                                    })
                                    .fail(function (event) {
                                        var data = event.responseJSON || false;
                                        var message = 'Неизвестный ответ сервера. Попробуйте повторить позже!';
                                        if (data) {
                                            var errors = data.errors;
                                            message = '';
                                            _(errors.no_field_value).each(function (error) {
                                                message += error + "\n";
                                            });
                                        }
                                        notify.alert(message);
                                    });
                            }

                            e.preventDefault();
                        }
                    }
                }).render();

                // прячем поле "Регион"
                var otherRegion = form.fields['other-region'];
                otherRegion.$el.hide();
                // и подписываемся на событие смены поля "Выберите регион",
                // если выбрали значение "Другой регион", то нужно показать поле "Регион"
                form.on('region:change', function (f, editor) {
                    var value = editor.getValue();
                    switch (value) {
                        case 'Другой регион':
                            otherRegion.$el.show();
                            otherRegion.editor.validators = ['required'];
                            break;
                        default:
                            otherRegion.$el.hide();
                            otherRegion.editor.validators = [];
                    }
                });

                // прячем поле "E-mail"
                var email = form.fields.email,
                    phone = form.fields.phone;
                email.$el.hide();
                // слушаем событие
                form.on('communication-type:change', function (f, editor) {
                    var value = editor.getValue();
                    switch (value) {
                        case 'E-mail':
                            email.$el.show();
                            email.editor.validators = ['required'];

                            phone.$el.hide();
                            phone.editor.validators = [];
                            break;
                        case 'Телефон':
                            email.$el.hide();
                            email.editor.validators = [];

                            phone.$el.show();
                            phone.editor.validators = ['required'];
                            break;
                    }
                });

                // рендер формы
                this.$('#askForm').html( form.el );
                return this;
            }
        },
        Toolbar: {
            init: function () {
                this.$button = this.$('#askRequest');
                // анимация и блокировка кнопки
                $(document).ajaxStart(this.ajaxStart.bind(this));
                $(document).ajaxComplete(this.ajaxComplete.bind(this));
            },
            ajaxStart: function () {
                this.$button.addClass('button_loading');
                this.undelegateEvents();
            },
            ajaxComplete: function () {
                this.$button.removeClass('button_loading');
                this.delegateEvents();
            },
            events: {
                'click #askRequest': 'askRequest'
            },
            askRequest: function () {
                if (!!form) {
                    form.$el.submit();
                }
            }
        }
    });

    return pageView.init();
});
