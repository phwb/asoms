/* global define, require, ymaps, window */
define([
    'backbone',
    // нотификатор
    'app/helper/notify',
    // шаблоны
    'views/page',
    'text!templates/offices/map.html'
], function (
    Backbone,
    // нотификатор
    notify,
    // шаблоны
    PageView,
    mapPage
) {
    "use strict";

    var $ = Backbone.$,
        maps = {};

    // функция-помощник загружает яндекс карты
    // контекст привязан к главной вьюшке
    // писать по нормальному не было времени
    function ymapsLoad() {
        this.$map.addClass('page_loader');
        require(['ymaps'], function () {
            this.$map.removeClass('page_loader');
            this.renderMap();
        }.bind(this), ymapsError.bind(this));
    }

    function ymapsError(err) {
        var failedId = err.requireModules && err.requireModules[0];
        var self = this;

        notify.confirm({
            message: 'Ошибка загрузки Яндекс.Карт, повторить попытку?',
            buttons: ['Нет', 'Да'],
            title: 'Внимание!',
            callback: function (index) {
                requirejs.undef(failedId);
                if (index > 1 || index === true) {
                    ymapsLoad.call(self);
                }
            }
        });
    }

    return function (params) {
        var model = params.model || false,
            callback = params.callback || $.noop,
            id;

        if (!model) {
            callback('Не задана модель');
            return this;
        }

        id = model.get('id');
        if (!maps[id]) {
            var page = new PageView({
                html: mapPage,
                Navbar: {
                    title: model.get('name')
                },
                Page: {
                    init: function () {
                        this.$map = this.$('.map');
                        this.on('render:map', this.checkMap);
                    },
                    checkMap: function () {
                        // проверяем загружена ли карта
                        // если да, то просто ничего не делаем
                        if (maps[id].mapLoaded) {
                            return this;
                        }

                        // грузим "Яндекс.Карты" только тогда, когда они нужны
                        // то есть по первому клику на кнопку "Карта"
                        if ('ymaps' in window) {
                            this.renderMap();
                        } else {
                            ymapsLoad.call(this);
                            /*this.$map.addClass('page_loader');
                            require(['ymaps'], function () {
                                this.$map.removeClass('page_loader');
                                this.renderMap();
                            }.bind(this));*/
                        }
                    },
                    renderMap: function () {
                        var coords = model.get('coords');
                        if (coords && coords.value) {
                            ymaps.ready(function () {
                                var map, placemark;
                                /** @property {object} map.geoObjects */
                                map = new ymaps.Map(this.$map[0], {
                                    center: coords.value,
                                    zoom: 16
                                });
                                placemark = new ymaps.Placemark(coords.value, {}, {
                                    preset: 'islands#icon',
                                    iconColor: '#dc0227'
                                    // iconLayout: 'default#image',
                                    // iconImageHref: './img/location.svg',
                                    // iconImageSize: [40, 40]
                                });
                                map.geoObjects.add(placemark);
                                // ставим флаг, что карта уже загружена
                                maps[id].mapLoaded = true;
                            }.bind(this));
                        }
                    }
                },
                Toolbar: {
                    show: false
                }
            });

            maps[id] = page.init();
            maps[id].renderMap = function () {
                this.page.trigger('render:map');
            };
        }

        return callback(undefined, maps[id]);
    };
});
