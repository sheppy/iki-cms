"use strict";

const url = require("url");
const path = require("path");


class Utilities {
    static isProduction() {
        return (process.env.NODE_ENV === "production");
    }

    static sideEffect(fn) {
        return d => {
            fn(d);
            return d;
        };
    }

    static realUrl(originalUrl) {
        return url.parse(originalUrl).pathname;
    }

    static sanitizePath(filePath) {
        return path.normalize(filePath).replace(/(\.\.)+/g, "");
    }
}

module.exports = Utilities;
