/* global define, $, _, window */
define([
    'backbone',
    'underscore',
    'app/helper/notify',
    // коллекции
    'collections/regions',
    'collections/cities',
    'collections/offices',
    'collections/hospitals',
    'collections/infos',
    'collections/links'
], function (
    Backbone,
    _,
    notify,
    // коллекции
    Regions,
    Cities,
    Offices,
    Hospitals,
    Infos,
    Links
) {
    'use strict';

    var ls = window.localStorage,
        period = 60 * 60 * 24 * 30 * 1000, // секунды + минуты + часы + сутки
        expireDate, now = +(new Date());

    var $ = Backbone.$;
    var $splash = $('#splash');

    function downloadResources(cb) {
        var splash = $splash;
        var url = 'https://alfastrahoms.ru';

        cb = cb || function () {};

        //ls.clear();
        $.ajax({
            url: url + '/api/regions/',
            method: 'get',
            dataType: 'json'
        })
            // города и регионы
            .then(function (data) {
                var regions = _(data);
                if (regions.isArray() === false) {
                    return false;
                }

                // сначала удаляем все что есть в базе
                Regions.localStorage._clear();
                Cities.localStorage._clear();
                /**
                 * добавляем регионы в коллекцию
                 *
                 * @property {Number} item.ID
                 * @property {String} item.NAME
                 * @property {Array} item.CITIES
                 * @property {String} item.HIDE_APP
                 */
                regions.each(function (item) {
                    var cities = _(item.CITIES);
                    if (cities.isArray() === false) {
                        return this;
                    }

                    var hide = Regions.model.prototype.defaults.hideCities;
                    if (item.HIDE_APP) {
                        hide = item.HIDE_APP === 'Y';
                    }
                    Regions.create({
                        id: item.ID,
                        name: item.NAME,
                        hideCities: hide
                    }, {silent: true});

                    /**
                     * добавляем города в коллекцию
                     * @params {object} city
                     * @property {Number} city.ID
                     * @property {String} city.NAME
                     * @property {String} city.MAP
                     * @property {String} city.SORT
                     */
                    cities.each(function (city) {
                        var sort = Cities.model.prototype.defaults.sort;
                        if (city.SORT) {
                            sort = +city.SORT || sort;
                        }
                        Cities.create({
                            id: city.ID,
                            name: city.NAME,
                            region: item.ID,
                            map: city.MAP || false,
                            sort: sort
                        }, {silent: true});
                    });
                });

                // устанавливаем по умолчанию первый активный регион и город
                var region, city;
                region = Regions.first();
                region.set({selected: true}, {silent: true}).save();

                city = Cities.find({region: region.get('id')});
                city.set({selected: true},  {silent: true}).save();

                return this;
            })
            // офисы
            .then(function () {
                var citiesID = Cities.map(function (item) {
                    return item.get('id');
                });
                if (!citiesID.length) {
                    return false;
                }

                return $.ajax({
                    url: url + '/api/offices/',
                    data: {
                        cities: citiesID
                    },
                    dataType: 'json',
                    method: 'get'
                });
            })
            .then(function (data) {
                var result = _(data);
                if (result.isEmpty()) {
                    return false;
                }

                Offices.localStorage._clear();
                result.each(function (offices, key) {
                    _(offices).each(function (item) {
                        var params = _.extend({city: key}, item);
                        Offices.create(params, {silent: true});
                    }, this);
                });

                return this;
            })
            // больницы
            .then(function () {
                var citiesID = Cities.map(function (item) {
                    return item.get('id');
                });
                if (!citiesID.length) {
                    return false;
                }
                return $.ajax({
                    url: url + '/api/hospitals/',
                    data: {
                        cities: citiesID
                    },
                    dataType: 'json',
                    method: 'get'
                });
            })
            .then(function (data) {
                var result = _(data);

                if (result.isEmpty()) {
                    return false;
                }

                Hospitals.localStorage._clear();
                result.each(function (offices, key) {
                    _(offices).each(function (item) {
                        var params = _.extend({city: key}, item);
                        Hospitals.create(params, {silent: true});
                    }, this);
                });

                return $.ajax({
                    url: url + '/api/info/',
                    dataType: 'json',
                    method: 'get'
                });
            })
            // информация
            .then(function (data) {
                var result = _(data);

                if (result.isEmpty()) {
                    return false;
                }

                Infos.localStorage._clear();
                result.each(function (item) {
                    var params = _.extend({}, item);
                    Infos.create(params, {silent: true});
                });
            })
            // ссылки
            .then(function () {
                var dfd = $.Deferred();
                $.ajax({
                    url: url + '/api/links/',
                    dataType: 'json',
                    method: 'get'
                })
                    .done(function (data) {
                        dfd.resolve(data);
                    })
                    .fail(function () {
                        dfd.resolve([
                            {
                                id: 1,
                                name: 'Брянская область',
                                link: 'https://napriem.info/Account/Login'
                            },
                            {
                                id: 2,
                                name: 'Кемеровская область',
                                link: 'http://lk.kemoms.ru/login.aspx'
                            },
                            {
                                id: 3,
                                name: 'Мурманская область',
                                link: 'http://price.omsmurm.ru/?menuItem=85'
                            }
                        ]);
                    });
                return dfd;
            })
            // парсинг ссылок
            .then(function (data) {
                var result = _(data);

                if (result.isEmpty()) {
                    return false;
                }

                Links.localStorage._clear();
                result.each(function (item) {
                    var params = _.extend({}, item);
                    Links.create(params, {silent: true});
                });
            })
            // все ОК, сохраняем в LS
            .then(function () {
                globalAnimation.download = true;
                hideSplash(splash);
                // создадим новую дату обновления и запищем в хранилице
                expireDate = new Date(now + period);
                ls.setItem('expire', +expireDate + '');
                cb();
            })
            .fail(function () {
                globalAnimation.download = true;
                hideSplash(splash);
                notify.alert('Ошибка интернет соединения!');
            });
    }

    var globalAnimation;

    function hideSplash(el, callback) {
        var key;

        if (typeof callback !== 'function') {
            callback = $.noop
        }

        for (key in globalAnimation) {
            if (globalAnimation.hasOwnProperty(key) && globalAnimation[key] === false) {
                return false;
            }
        }
        el.removeClass('loading').hide();
        callback()
    }

    function animationStart(callback) {
        var dfd1 = $.Deferred();
        var dfd2 = $.Deferred();

        $('#animArc').removeClass('splash__anim_hidden');
        setTimeout(function () {
            $('#animPolice').removeClass('splash__anim_hidden');
            dfd1.resolve();
        }, 300);
        setTimeout(function () {
            $('#animProtect').removeClass('splash__anim_hidden');
            dfd2.resolve();
        }, 500);

        $.when(dfd1, dfd2).then(function () {
            setTimeout(function () {
                globalAnimation.animation = true;
                hideSplash($splash, callback);
            }, 3000);
        });
    }

    function checkResources(immediate, callback) {
        var splash = $splash,
            needUpdate;

        globalAnimation = {
            animation: false,
            download: false
        };

        // старт анимации супермена
        animationStart(callback);
        // флаг обновления данных
        immediate = immediate || false;

        if (immediate) {
            splash.addClass('loading').show();
            downloadResources(function () {
                Backbone.Events.trigger('action:main');
            });
            return true;
        }

        needUpdate = (function () {
            var update = ls.getItem('update');
            ls.setItem('update', 'Y');
            return !update || update === 'N';
        } ());

        // читаем дату из хранилица
        expireDate = +ls.getItem('expire');

        // если нужно обновить то просто сбросим дату последнего обновления
        if (needUpdate) {
            expireDate = false;
        }

        if (!expireDate) {
            // если ее нет, то сразу грузим ресурсы
            downloadResources(callback);

            return true;
        } else if (now > expireDate) {
            notify.confirm({
                message: 'Данные могли устареть, обновить информацию?',
                buttons: ['Отмена', 'Обновить'],
                callback: function (index) {
                    if (index > 1 || index === true) {
                        downloadResources(callback);

                        return true;
                    }
                    globalAnimation.download = true;
                    hideSplash(splash);

                    return false;
                }
            });

            return true;
        }
        globalAnimation.download = true;
        hideSplash(splash, callback);

        return false;
    }

    return checkResources;
});
