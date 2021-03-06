/*global define*/
define([
    'backbone'
], function (Backbone) {
    'use strict';

    return Backbone.Model.extend({
        defaults: {
            fio: '',
            birthday: '',
            enp: '',
            sex: '',
            number: 0,
            date: '',
            status: 'Полис не проверен'
        },
        schema: {
            fio: {
                type: 'Text',
                title: 'ФИО',
                validators: ['required', {
                    type: 'regexp',
                    regexp: /^[а-яёА-ЯЁA-Za-z ,.'-]+$/i
                }],
                editorAttrs: {
                    placeholder: 'Указать'
                }
            },
            birthday: {
                type: 'Date',
                title: 'Дата рождения'
            },
            enp: {
                type: 'Text',
                title: 'Единый номер полиса',
                validators: ['required'],
                editorAttrs: {
                    placeholder: 'Указать'
                }
            },
            sex: {
                type: 'Select',
                title: 'Ваш пол',
                options: [
                    {
                        label: 'Мужской',
                        val: 'M'
                    },
                    {
                        label: 'Женский',
                        val: 'F'
                    }
                ]
            },
            blank: {
                type: 'Text',
                title: 'Номер бланка',
                editorAttrs: {
                    placeholder: 'Указать'
                }
            },
            date: {
                type: 'Date',
                title: 'Срок действия, если есть'
            }
        }
    });
});
