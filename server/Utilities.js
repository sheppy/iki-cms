"use strict";

const url = require("url");
const path = require("path");

const REGEX_PARENT_DIRECTORY = /(\.){2}/g;
const REGEX_DOUBLE_BACK_SLASH = /(\\){2}/g;
const REGEX_DOUBLE_FORWARD_SLASH = /(\/){2}/g;


class Utilities {
    /**
     * Check if we are running in production.
     *
     * @returns {boolean} - Whether we are running in production or not.
     */
    static isProduction() {
        return (process.env.NODE_ENV === "production");
    }

    /**
     * Run a side affect function on a param, returning the param again.
     *
     * @param {Function} fn - The side effect function.
     * @returns {Function} - The side effected function.
     */
    static sideEffect(fn) {
        return d => {
            fn(d);
            return d;
        };
    }

    /**
     * Get the url pathname from a url.
     *
     * @param {string} originalUrl - The original url.
     * @returns {string} - The url pathname.
     */
    static getUrlPathname(originalUrl) {
        return url.parse(originalUrl).pathname;
    }

    /**
     * Sanitize a path, by remove parent directory and double slashes.
     *
     * @param {string} filePath - The path to sanitzie.
     * @returns {string} - The sanitized path.
     */
    static sanitizePath(filePath) {
        return path.normalize(filePath)
            .replace(REGEX_PARENT_DIRECTORY, "")
            .replace(REGEX_DOUBLE_BACK_SLASH, "\\")
            .replace(REGEX_DOUBLE_FORWARD_SLASH, "/");
    }
}


module.exports = Utilities;
