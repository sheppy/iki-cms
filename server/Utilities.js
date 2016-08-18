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

    static getUrlPathname(originalUrl) {
        return url.parse(originalUrl).pathname;
    }

    static sanitizePath(filePath) {
        return path.normalize(filePath)
            .replace(/(\.){2}/g, "")
            .replace(/(\\){2}/g, "\\")
            .replace(/(\/){2}/g, "/");
    }
}

module.exports = Utilities;
