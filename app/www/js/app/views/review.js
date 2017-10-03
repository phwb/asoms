define([
    'backbone',
    'underscore',
    'store',
    'views/page',
    'text!templates/review/index.html',
    'text!templates/review/loader.html',
    'app/helper/device',
    'collections/regions',
    'app/helper/notify',
    'app/helper/modal/index'
], function (
    Backbone,
    _,
    Store,
    PageView,
    pageHTML,
    loaderHTML,
    device,
    regions,
    notify,
    modal
) {
    'use strict';

    var C_ID = 'review'

    var $ = Backbone.$
    var ajax = Backbone.ajax
    var bind = _.bind
    var each = _.each
    var isEmpty = _.isEmpty
    var ReviewModel = Backbone.Model.extend({
        defaults: {
            rating: '',
            review: '',
            contact: ''
        },

        localStorage: new Store('ReviewModel')
    })

    if (!regions.length) {
        regions.fetch({
            reset: true
        })
    }

    return function (ratingValue) {
        var isBackClicked = false
        // по стайлгайдам академии
        // 1. геттеры/сеттеры свойств объекта
        // 2. основные методы объекта
        // 3. обработчики событий
        var pageView = new PageView({
            html: pageHTML,

            Navbar: {
                title: 'Оставить отзыв'
            },

            Page: {
                model: new ReviewModel({
                    id: C_ID
                }),

                events: {
                    'change form': 'onFormChange',
                    'submit form': 'onFormSubmit'
                },

                init: function () {
                    this.$content = this.$('.page-content')
                    this.listenTo(this.model, 'sync', bind(this.onModelFetch, this))
                    this.model.fetch()
                },

                render: function () {
                    // установим рейтинг
                    var ratingElement = this.$('#reviewRating')

                    if (!isEmpty(ratingValue)) {
                        ratingElement
                            .val(ratingValue)
                            .trigger('change')
                    }

                    ratingElement.barrating({
                        theme: 'css-stars'
                    })

                    return this
                },

                onFormChange: function (e) {
                    var changedElement = $(e.target)
                    var name = changedElement.attr('name')
                    var value = changedElement.val()

                    this.model
                        .set(name, value)
                        .save()
                },

                onFormSubmit: function (e) {
                    e.preventDefault()

                    var region = regions.getSelected()
                    var appData = $.param({
                        os: device.os,
                        region: region && region.get('name')
                    })
                    var formData = this.$('form').serialize()
                    var ajaxParams = {
                        type: 'POST',
                        url: 'http://alfastrahoms.ru/api/reviews/',
                        data: appData + '&' + formData
                    }

                    this.$content.html(loaderHTML)

                    ajax(ajaxParams)
                        .done(bind(this.onAjaxSuccess, this))
                        .fail(bind(this.onAjaxFail, this))
                        .always(bind(this.onAjaxEnd, this))
                },

                onModelFetch: function () {
                    var _this = this
                    var idAttribute = this.model.idAttribute

                    // заполняем форму значениями из модели
                    each(this.model.attributes, function (value, key) {
                        if (key !== idAttribute) {
                            var currentElement = _this.$('[name="' + key + '"]')
                            var currentValue = currentElement.val()

                            if (isEmpty(currentValue)) {
                                currentElement.val(value)
                            }
                        }
                    })
                },

                onAjaxSuccess: function () {
                    this.$('.loader').html(
                        '<div style="text-align:center">' +
                        '  <h1>Спасибо!</h1>' +
                        '  Ваша оценка и отзыв отправлены.' +
                        '</div>'
                    )

                    var model = this.model
                    var idAttribute = model.idAttribute

                    // очищаем модель
                    each(model.attributes, function (value, key) {
                        if (key !== idAttribute) {
                            model.set('key', '')
                        }
                    })

                    model.save()
                    // больше не показываем попап если отзыв отправлен
                    modal.neverShowAgain()
                },

                onAjaxFail: function () {
                    this.$('.loader').html(
                        '<div style="text-align:center">' +
                        '  <h1>Ошибка.</h1>' +
                        '  Во время отправки произошла ошибка.<br>' +
                        '  Пожалуйста, попробуйте отправить позже.' +
                        '</div>'
                    )

                    if (isBackClicked) {
                        notify.confirm({
                            message: 'Произошла ошибка при отправке отзыва',
                            buttons: ['Отложить', 'Повторить'],
                            callback: function (index) {
                                if (index > 1 || index === true) {
                                    Backbone.Events.trigger('action:' + C_ID)
                                    return true;
                                }

                                return false;
                            }
                        })
                    }
                },

                onAjaxEnd: function () {
                    this.trigger('ajaxEnd')
                }
            },

            Toolbar: {
                events: {
                    'click button': 'onClick'
                },

                onClick: function (e) {
                    e.preventDefault()

                    this.trigger('submit')
                }
            }
        });

        var initializedPage = pageView.init()

        var page = initializedPage.page
        var toolbar = initializedPage.toolbar
        var toolbarButton = toolbar.$('button')

        toolbar.on('submit', function () {
            page.$('form').submit()

            toolbar.undelegateEvents()
            toolbarButton
                .text('OK')
                .click(function (e) {
                    e.preventDefault()

                    isBackClicked = true
                    Backbone.Events.trigger('page:back')
                })
        })

        return initializedPage
    }
});
