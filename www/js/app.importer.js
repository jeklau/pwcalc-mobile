/*
 * (C) Copyright P.Morjan 2014
 * All rights reserved.
 */

/*
 * example str: {"bar":8,"foo":16}
 * example func: add(alias, pwlen)
 */

 /* global cordova, ko, utils, QRCode, app */

app.importer = {
    error: '',
    counter: 0,
    importStr: function (str, func) {
        'use strict';
        var obj = {}, key, val;
        this.error = '';
        this.counter = 0;
        try {
            obj = JSON.parse(str);
        } catch (exception) {
            this.error = 'invalid string:\n' +
                    (utils.isPrintable(str) ? str.substring(0, 100) : '...') +
                    '\n' + exception.toString();
            return;
        }

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof key !== 'string') {
                    this.error = 'invalid alias: ' + key.toString();
                    return;
                }
                if (key === '') {
                    this.error = 'empty alias';
                    return;
                }
                if (/\s/g.test(key)) {
                    this.error = 'aliases must not contain white spaces';
                    return;
                }
                val = obj[key];

                if (! utils.isInteger(val)) {
                    this.error = 'invalid number: ' + val.toString();
                    return;
                }
                if (val % 1 !== 0 || val > 28 || val < 1) {
                    this.error = 'number out of range: ' + val.toString();
                    return;
                }
            }
        }

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                func(key, obj[key]);
                this.counter++;
            }
        }
        return true;
    }
};

