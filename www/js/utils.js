var utils = {

    hasCordova: window.cordova ? true : false,

    isPrintable: function (str) {
        var re = /^[\x20-\x7e]*$/;
        return re.test(str);
    },
    isNumber: function (n) {
        return (typeof n === "number" && !isNaN(n));
    },
    isInteger: function (n) {
        return (typeof n === "number" && isFinite(n) && n % 1 === 0);
    }

};
