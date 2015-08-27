/*
 * (C) Copyright P.Morjan 2014
 * All rights reserved.
 */
 /* global ko, utils */
app.ViewModel = function () {
    "use strict";
    var self = this;
    //
    // Data
    //
    self.appVersion = ko.observable("unknown");
    self.pwlens = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                   19, 20, 21, 22, 23, 24, 25, 26, 27, 28];

    self.hasCordova      = utils.hasCordova;
    self.cfgDefaultPwlen = ko.observable(16, {persist: "defaultPwlen"});
    self.recentAliases   = ko.observableArray([], {persist: "aliases"});
    self.aliasSelected   = ko.observable().extend({notify : "always"});

    self.curAlias = ko.observable("").extend({ignoreWhiteSpaces : null});
    self.curPwlen = ko.observable();
    self.secret   = ko.observable();

    self.password = ko.computed(function () {
        if (self.secret() && self.curAlias() && self.curPwlen()) {
            return b64_sha1(self.secret() + self.curAlias())
                    .substring(0, self.curPwlen());
        } else {
            return "";
        }
    }).extend({notify : "always"});

    //
    // Operations
    //
    self.sort = function () {
        self.recentAliases.sort(function (l, r) {
            return l.alias.toLowerCase() === r.alias.toLowerCase() ?
                    0 : (l.alias.toLowerCase() < r.alias.toLowerCase() ? -1 : 1);
        });
    };

    self.select = function () {
        self.curAlias(this.alias);
        self.curPwlen(this.pwlen);
        self.aliasSelected(true);
    };

    self.add = function (alias, pwlen) {
        if (alias.length < 1) {
            return;
        }
        self.recentAliases.remove(function (item) {
            return item.alias === alias;
        });
        self.recentAliases.push({alias: alias, pwlen: pwlen});
        self.sort();
    };

    self.addCurrent = function () {
        self.add(self.curAlias(), self.curPwlen());
    };

    self.remove = function () {
        self.recentAliases.remove(this);
    };

    self.recentAliasesToStr = function () {
        //  {"foo":18, "bar": 14}
        var obj = {};
        for (var i = 0, l = self.recentAliases().length; i < l; i++) {
            obj[self.recentAliases()[i].alias] = self.recentAliases()[i].pwlen;
        }
        return JSON.stringify(obj);
    };

    self.reset = function () {
        self.curAlias("");
        self.curPwlen(self.cfgDefaultPwlen());
        self.secret("");
        self.sort();
    };

    if (utils.hasCordova) {
        cordova.getAppVersion(function (version) {
            self.appVersion(version);
        });
     };
};

(function (ko) {
    if (!ko.extenders.ignoreWhiteSpaces) {
        ko.extenders.ignoreWhiteSpaces = function (target) {
            "use strict";
            var result = ko.computed({
                read : target,
                write : function (newValue) {
                    var curr = target();
                    var valueToWrite = newValue ? newValue.replace(/\s+/g, "") : newValue;
                    if (valueToWrite !== curr) {
                        target(valueToWrite);
                    } else {
                        if (newValue !== curr) {
                            target.notifySubscribers(valueToWrite);
                        }
                    }
                }
            }).extend({notify: "always"});

            result(target());
            return result;
        };
    }

})(ko);

