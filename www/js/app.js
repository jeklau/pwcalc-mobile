/*
 * (c) copyright p.morjan 2014
 * all rights reserved.
 */

/* jshint jquery: true */
/* global cordova, ko, utils, QRCode */

var app = (function () {
    "use strict";
    var QRCODE_DUMMY = "SHA1 Password Calculator";
    var KEY_CODE_SPACE = 32;
    var KEY_CODE_CR = 13;

    var popupText = function (str) {
        var top = window.orientation === 0 ? "210px" : "80px";
        var element =
            $('<div class="ui-loader ui-overlay-shadow ui-body-e ui-corner-all">' +
            str + '<br></div>');

        setTimeout(function () {
            element.addClass("popupClipboard")
                .css("top", top)
                .delay(1500)
                .appendTo($.mobile.pageContainer)
                .fadeOut(0, function () {
                    $(this).remove();
                });
        }, 300);
    };

    var copyToClipboard = function (str) {
        if (str.length < 1) {
            return;
        }
        if (utils.hasCordova) {
            cordova.plugins.clipboard.copy(str,
                function () {
                    popupText("Password coppied to clipboard");
                },
                function () {
                    alert("copy to clipboard failed");
                });
        } else {
            window.prompt("Copy to clipboard: Ctrl/Cmd +C, Enter", str);
        }
    };

    var qrcode = function ($div, text, size, colorDark, colorLight) {
        $div.empty();
        try {
            return new QRCode($div[0], {
                text: text || QRCODE_DUMMY,
                width: size || 128,
                height: size || 128,
                colorDark: colorDark || "black",
                colorLight: colorLight || "white",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (exception) {
            alert('creating QR code failed: ' + exception.toString());
        }
    };

    var updateQrcode = function (text) {
        qrcode($("#qrcode"), text, 128, "grey", "black");
    };

    var popupQrcode = function (text) {
        var width  = $(window).width();
        var height = $(window).height();
        var size = width > height ? height : width;
        size = Math.round(size * 0.8);
        if (qrcode($("#qrcodeBig"), text , size, "white", "black"))
            $("#qrcodeBig").popup("open");
    };

    var shareText = function (text) {
        if (!(text)) {return; }
        if (utils.hasCordova) {
            window.plugins.socialsharing.share(text);
        } else {
            copyToClipboard(text);
        }
    };

    var importAliasesFromClipboard = function (addFunc) {
        if (utils.hasCordova) {
            try {
                cordova.plugins.clipboard.paste(
                    function (str) {
                        if (app.importer.importStr(str, addFunc)) {
                            popupText(app.importer.counter + " aliases imported");
                        } else {
                            alert(app.importer.error);
                        }
                    },
                    null,
                    function () {
                        alert("Paste from Clipboard failed");
                    }
                );
            } catch (e) {
                alert (e);
            }
        }
    };

    var testImport = function (addFunc) {
        var str = '{"gmail.com": 16, "amazon.com": 28, "my.keystore": 8, "jane@foo.bar": 13}';
        if (app.importer.importStr(str, addFunc)) {
            popupText(app.importer.counter + " aliases imported");
        } else {
            alert(app.importer.error);
        }
    };

    var onDeviceReady = function () {
        var model = new app.ViewModel();
        ko.applyBindings(model);
        //
        // Model Event Handler
        //
        model.curPwlen.subscribe(function () {
            $("#selectPwlen").selectmenu("refresh", true);
        });

        model.cfgDefaultPwlen.subscribe(function () {
            $("#cfgDefaultPwlen").selectmenu("refresh", true);
        });

        model.password.subscribe(function (value) {
            updateQrcode(value);
        });

        model.recentAliases.subscribe(function () {
            if (model.recentAliases().length < 1) {
                $("#aliasCollapse").collapsible("collapse");
            }
            $("#aliasList").listview("refresh");
        });

        model.aliasSelected.subscribe(function () {
            $("#aliasCollapse").collapsible("collapse");
            $("#alias").focus();
            $("#secret").focus();
        });
        //
        // UI Event Handler
        //
        $("#btCopy").on("click", function () {
            if (model.password().length > 0) {
                model.addCurrent();
                copyToClipboard(model.password());
                $("input").blur();
            }
        });

        $("#aliasCollapse").on("collapsibleexpand", function () {
            $("#qrcode").hide();
        });

        $("#aliasCollapse").on("collapsiblecollapse", function () {
            setTimeout(function () {
                $("#qrcode").show();
            }, 100);
        });

        $("#qrcode").on("click", function (event) {
            if (event.shiftKey === true && event.altKey === true){
                testImport(model.add);
            } else {
                popupQrcode(model.password());
            }
        });

        $("#aImport").on("click", function () {
            $("#popupMenu").popup("close");
            importAliasesFromClipboard(model.add);
        });

        $("#aShareText").on("click", function () {
            $("#popupMenu").popup("close");
            shareText(model.recentAliasesToStr());
        });

        $("#alias").keydown(function (event) {
            var code = event.keyCode || event.which;
            return code === KEY_CODE_SPACE ? false : true;
        });

        $(document).keydown(function (event) {
            if (event.keyCode === KEY_CODE_CR) {
                $("#btCopy").trigger("click");
                event.preventDefault();
            }
        });

        model.reset();

        $(".hidden").removeClass("hidden");

    };

    return {
        onDeviceReady: onDeviceReady
    };
})();

