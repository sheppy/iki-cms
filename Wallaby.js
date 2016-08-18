module.exports = function() {
    return {
        files: [
            "server/**/*.js",
            { pattern: "test/helper/index.js", instrument: false }
        ],

        tests: ["test/**/*.spec.js"],
        env: { type: "node" },

        setup: function(wallaby) {
            require("./test/helper/index");
        },

        testFramework: "mocha",
        lowCoverageThreshold: 70
    };
};
