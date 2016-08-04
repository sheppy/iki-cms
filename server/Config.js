"use strict";

const yamlConfig = require("yaml-config");

class Config {
    static load(configPath) {
        Config.settings = yamlConfig.readConfig(configPath);
        return Config.settings;
    }

    static get(setting) {
        return Config.settings[setting];
    }
}

Config.settings = {};

module.exports = Config;
