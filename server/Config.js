"use strict";

const yamlConfig = require("yaml-config");


class Config {
    /**
     * Load a configuration.
     *
     * @param {string} configPath - The path to the configuration.
     * @returns {Object} - The configuration.
     */
    static load(configPath) {
        Config.settings = yamlConfig.readConfig(configPath);
        return Config.settings;
    }

    /**
     * Get a specific config setting.
     *
     * @param {string} setting - The setting to get.
     * @returns {*} - The config setting requested.
     */
    static get(setting) {
        return Config.settings[setting];
    }
}

Config.settings = {};


module.exports = Config;
