"use strict";

const PrettyError = require("pretty-error");

// Friendlier error messages
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage("nunjucks");


const CmsErrorHandler = function(app) {
    app.on("error", function(err) {
        console.error(pe.render(err));
    });
};

module.exports = CmsErrorHandler;
