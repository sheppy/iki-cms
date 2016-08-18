"use strict";

const path = require("path");
const Utilities = require("../../server/Utilities");

describe("Utilities", function() {
    describe("isProduction", function() {
        let oldEnv;

        beforeEach(function() {
            oldEnv = process.env.NODE_ENV;
        });

        afterEach(function() {
            process.env.NODE_ENV = oldEnv;
        });

        it("returns true when in production", function() {
            process.env.NODE_ENV = "production";
            Utilities.isProduction().should.be.true;
        });

        it("returns false when in development", function() {
            process.env.NODE_ENV = "development";
            Utilities.isProduction().should.be.false;
        });

        it("returns false when in test", function() {
            process.env.NODE_ENV = "test";
            Utilities.isProduction().should.be.test;
        });
    });

    describe("sideEffect", function() {
        it("allows you to do stuff before returning parameter", function() {
            let d = { num: 1 };
            let fn = function() {
                d.num++;
            };

            Utilities.sideEffect(fn)(d).should.deep.equal({ num: 2 })
        });
    });

    describe("getUrlPathname", function() {
        let tests = [
            { input: "/", output: "/" },
            { input: "http://www.test.com/", output: "/" },
            { input: "/a", output: "/a" },
            { input: "http://www.test.com/b", output: "/b" },
            { input: "/c?a=2", output: "/c" },
        ];

        tests.forEach(function(test) {
            it("gets the url pathname", function() {
                Utilities.getUrlPathname(test.input).should.equal(test.output);
            });
        });
    });

    describe("sanitizePath", function() {
        let tests = [
            { input: "", output: "." },
            { input: "/", output: `${path.sep}` },
            { input: "//", output: `${path.sep}` },
            { input: "\\", output: `${path.sep}` },
            { input: "a/", output: `a${path.sep}` },
            { input: "a/../", output: `a${path.sep}` }
        ];

        tests.forEach(function(test) {
            it("prevents traversing up directories", function() {
                Utilities.sanitizePath(test.input).should.equal(test.output);
            });
        });
    });
});

