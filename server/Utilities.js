"use strict";

const url = require("url");
const path = require("path");

const REGEX_PARENT_DIRECTORY = /(\.){2}/g;
const REGEX_DOUBLE_BACK_SLASH = /(\\){2}/g;
const REGEX_DOUBLE_FORWARD_SLASH = /(\/){2}/g;

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
            .replace(REGEX_PARENT_DIRECTORY, "")
            .replace(REGEX_DOUBLE_BACK_SLASH, "\\")
            .replace(REGEX_DOUBLE_FORWARD_SLASH, "/");
    }
}

module.exports = Utilities;
