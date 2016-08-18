"use strict";

const mockConfig = { a: 1, b: 2 };
const yamlConfigStub = { readConfig: sinon.stub().returns(mockConfig) };
const Config = proxyquire("../../server/Config", { "yaml-config": yamlConfigStub });

describe("Config", function() {
    it("has a settings object", function() {
        Config.settings.should.be.an.object;
        Config.settings.should.be.empty;
    });

    describe("load", function() {
        it("reads the config yaml file specified in to settings", function() {
            Config.load("fake/config.yml");
            Config.settings.should.equal(mockConfig);
        });

        it("returns the config yaml file specified", function() {
            Config.load("fake/config.yml").should.equal(mockConfig);
        });
    });

    describe("get", function() {
        it("returns the setting", function() {
            Config.settings = { a: 12 };
            Config.get("a").should.equal(12);
        });

        it("returns undefined for settings that do not exist", function() {
            Config.settings = { a: 12 };
            should.equal(Config.get("b"), undefined);
        });
    });
});
