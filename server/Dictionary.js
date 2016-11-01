"use strict";


class Dictionary extends Map {
    /**
     * Create a new Dictionary.
     *
     * @param {Object} iterable - The initial map.
     * @param {string} [defaultKey] - The default key to use.
     */
    constructor(iterable, defaultKey) {
        super();
        this.defaultKey = defaultKey;
        this.buildMap(iterable);
    }

    /**
     * Convert a plain object to a Map.
     *
     * @param {Object} iterable - The initial map.
     */
    buildMap(iterable) {
        Object.keys(iterable).forEach(key => {
            this.set(key, iterable[key]);
        });
    }

    /**
     * Get a value from the dictionary.
     *
     * Returns the default key if set.
     *
     * @param {string} key - The key of the item.
     * @returns {*} - The value of the item.
     */
    get(key) {
        let value = super.get(key);

        if (typeof value === "undefined") {
            value = super.get(this.defaultKey);
        }

        return value;
    }
}


module.exports = Dictionary;
